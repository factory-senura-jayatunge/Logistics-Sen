from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api.v1.routes import customers, facilities, orders, shipments, inventory, vehicles, users, dashboard, notifications, search, analytics, route_planning, forecasting
from app.ws.manager import ws_manager
from app.db.database import SessionLocal
from app.models import models
from app.logging import logger
import time

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Acme Logistics API",
    description="Enterprise logistics management platform API",
    version="1.0.0",
)

logger.info("application_startup", app_name="Acme Logistics API", version="1.0.0")

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
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(route_planning.router, prefix="/api/v1")
app.include_router(forecasting.router, prefix="/api/v1")


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
