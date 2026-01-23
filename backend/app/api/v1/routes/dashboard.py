from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_shipments = db.query(models.Shipment).count()
    shipments_in_transit = db.query(models.Shipment).filter(models.Shipment.status == "in_transit").count()
    shipments_delivered = db.query(models.Shipment).filter(models.Shipment.status == "delivered").count()
    shipments_delayed = db.query(models.Shipment).filter(models.Shipment.status == "delayed").count()

    total_orders = db.query(models.Order).count()
    orders_pending = db.query(models.Order).filter(models.Order.status == "pending").count()

    current_year = datetime.utcnow().year
    total_orders_shipped_this_year = db.query(models.Order).filter(
        models.Order.status == "shipped",
        func.extract("year", models.Order.updated_at) == current_year,
    ).count()

    total_inventory_items = db.query(models.InventoryItem).count()
    low_stock_items = db.query(models.InventoryItem).filter(
        models.InventoryItem.status.in_(["low_stock", "out_of_stock"])
    ).count()

    total_vehicles = db.query(models.Vehicle).count()
    vehicles_en_route = db.query(models.Vehicle).filter(models.Vehicle.status == "en_route").count()

    total_facilities = db.query(models.Facility).count()

    return schemas.DashboardStats(
        total_shipments=total_shipments,
        shipments_in_transit=shipments_in_transit,
        shipments_delivered=shipments_delivered,
        shipments_delayed=shipments_delayed,
        total_orders=total_orders,
        orders_pending=orders_pending,
        total_orders_shipped_this_year=total_orders_shipped_this_year,
        total_inventory_items=total_inventory_items,
        low_stock_items=low_stock_items,
        total_vehicles=total_vehicles,
        vehicles_en_route=vehicles_en_route,
        total_facilities=total_facilities,
    )


@router.get("/recent-shipments", response_model=list[schemas.ShipmentWithCustomer])
def get_recent_shipments(limit: int = 5, db: Session = Depends(get_db)):
    from sqlalchemy.orm import joinedload
    return db.query(models.Shipment).options(
        joinedload(models.Shipment.customer)
    ).order_by(models.Shipment.updated_at.desc()).limit(limit).all()


@router.get("/shipment-status-breakdown")
def get_shipment_status_breakdown(db: Session = Depends(get_db)):
    """Get count of shipments by status for pie chart"""
    results = db.query(
        models.Shipment.status,
        func.count(models.Shipment.id).label("count")
    ).group_by(models.Shipment.status).all()
    
    return [{"status": status, "count": count} for status, count in results]


@router.get("/shipment-volume")
def get_shipment_volume(days: int = 30, db: Session = Depends(get_db)):
    """Get daily shipment counts for the last N days"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    results = db.query(
        func.date(models.Shipment.created_at).label("date"),
        func.count(models.Shipment.id).label("count")
    ).filter(
        models.Shipment.created_at >= start_date
    ).group_by(
        func.date(models.Shipment.created_at)
    ).order_by(
        func.date(models.Shipment.created_at)
    ).all()
    
    return [{"date": str(date), "count": count} for date, count in results]
