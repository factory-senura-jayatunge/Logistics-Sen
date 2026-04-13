import os
import sys
import threading
import time

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import joinedload

from app.api.v1.routes import (
    analytics,
    bulk,
    customers,
    dashboard,
    facilities,
    forecasting,
    inventory,
    notifications,
    orders,
    route_planning,
    search,
    shipments,
    users,
    vehicles,
)
from app.db.database import Base, SessionLocal, engine
from app.logging import logger
from app.models import models
from app.services.inventory_alerts import sync_low_stock_notification
from app.ws.manager import ws_manager

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Acme Logistics API",
    description="Enterprise logistics management platform API",
    version="1.0.0",
)

logger.info("application_startup", app_name="Acme Logistics API", version="1.0.0")

inventory_scan_interval_hours = max(float(os.getenv("INVENTORY_SCAN_INTERVAL_HOURS", "24")), 1)
inventory_scan_initial_delay_seconds = max(
    int(os.getenv("INVENTORY_SCAN_INITIAL_DELAY_SECONDS", "60")), 0
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(facilities.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(shipments.router, prefix="/api/v1")
app.include_router(inventory.router, prefix="/api/v1")
app.include_router(vehicles.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(bulk.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(route_planning.router, prefix="/api/v1")
app.include_router(forecasting.router, prefix="/api/v1")


def run_inventory_scan_once():
    db = SessionLocal()
    try:
        items = (
            db.query(models.InventoryItem)
            .options(joinedload(models.InventoryItem.facility))
            .all()
        )

        created_notifications = 0
        for item in items:
            if sync_low_stock_notification(db, item):
                created_notifications += 1

        db.commit()
        logger.info(
            "inventory_scan_completed",
            items_scanned=len(items),
            notifications_created=created_notifications,
        )
    except Exception as exc:
        db.rollback()
        logger.exception("inventory_scan_failed", error=str(exc))
    finally:
        db.close()


def inventory_scan_loop(stop_event: threading.Event):
    if stop_event.wait(inventory_scan_initial_delay_seconds):
        return

    while not stop_event.is_set():
        run_inventory_scan_once()
        if stop_event.wait(int(inventory_scan_interval_hours * 3600)):
            break


@app.on_event("startup")
def start_inventory_scan_thread():
    if "pytest" in sys.modules or os.getenv("ACME_DISABLE_BACKGROUND_JOBS") == "1":
        return
    if getattr(app.state, "inventory_scan_thread", None):
        return

    stop_event = threading.Event()
    thread = threading.Thread(
        target=inventory_scan_loop,
        args=(stop_event,),
        name="inventory-scan",
        daemon=True,
    )
    app.state.inventory_scan_stop_event = stop_event
    app.state.inventory_scan_thread = thread
    thread.start()

    logger.info(
        "inventory_scan_started",
        interval_hours=inventory_scan_interval_hours,
        initial_delay_seconds=inventory_scan_initial_delay_seconds,
    )


@app.on_event("shutdown")
def stop_inventory_scan_thread():
    stop_event = getattr(app.state, "inventory_scan_stop_event", None)
    if stop_event is not None:
        stop_event.set()


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming HTTP requests with timing information."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    logger.info(
        "http_request",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=round(process_time * 1000, 2),
    )
    return response


@app.websocket("/ws/shipments/{shipment_id}")
async def shipment_websocket(websocket: WebSocket, shipment_id: int):
    await ws_manager.connect(websocket, shipment_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, shipment_id)


@app.get("/")
def root():
    return {"message": "Acme Logistics API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health_check():
    logger.debug("health_check", status="healthy")
    return {"status": "healthy"}
