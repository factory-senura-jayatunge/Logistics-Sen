import csv
import io
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/delivery-trends")
def get_delivery_trends(days: int = Query(90, ge=7, le=365), db: Session = Depends(get_db)):
    """On-time delivery rate trends over time, grouped by week."""
    start_date = datetime.utcnow() - timedelta(days=days)

    results = (
        db.query(
            func.strftime("%Y-%W", models.Shipment.updated_at).label("week"),
            func.count(models.Shipment.id).label("total"),
            func.sum(case((models.Shipment.status == "delivered", 1), else_=0)).label("delivered"),
            func.sum(case((models.Shipment.status == "delayed", 1), else_=0)).label("delayed"),
        )
        .filter(models.Shipment.created_at >= start_date)
        .group_by(func.strftime("%Y-%W", models.Shipment.updated_at))
        .order_by(func.strftime("%Y-%W", models.Shipment.updated_at))
        .all()
    )

    return [
        {
            "week": week,
            "total": total,
            "delivered": delivered,
            "delayed": delayed,
            "on_time_rate": round((total - delayed) / total * 100, 1) if total > 0 else 0,
        }
        for week, total, delivered, delayed in results
    ]


@router.get("/carrier-performance")
def get_carrier_performance(db: Session = Depends(get_db)):
    """Carrier performance comparison: shipment counts and on-time rates."""
    results = (
        db.query(
            models.Shipment.carrier,
            func.count(models.Shipment.id).label("total_shipments"),
            func.sum(case((models.Shipment.status == "delivered", 1), else_=0)).label("delivered"),
            func.sum(case((models.Shipment.status == "delayed", 1), else_=0)).label("delayed"),
            func.sum(case((models.Shipment.status == "in_transit", 1), else_=0)).label(
                "in_transit"
            ),
            func.avg(models.Shipment.weight_kg).label("avg_weight"),
        )
        .group_by(models.Shipment.carrier)
        .order_by(func.count(models.Shipment.id).desc())
        .all()
    )

    return [
        {
            "carrier": carrier,
            "total_shipments": total,
            "delivered": delivered,
            "delayed": delayed,
            "in_transit": in_transit,
            "avg_weight": round(avg_weight, 1) if avg_weight else 0,
            "on_time_rate": round((total - delayed) / total * 100, 1) if total > 0 else 0,
        }
        for carrier, total, delivered, delayed, in_transit, avg_weight in results
    ]


@router.get("/facility-utilization")
def get_facility_utilization(db: Session = Depends(get_db)):
    """Facility utilization: capacity, staff, inventory counts."""
    facilities = db.query(models.Facility).all()
    result = []
    for f in facilities:
        inventory_count = (
            db.query(func.count(models.InventoryItem.id))
            .filter(models.InventoryItem.facility_id == f.id)
            .scalar()
        )
        total_stock = (
            db.query(func.coalesce(func.sum(models.InventoryItem.quantity), 0))
            .filter(models.InventoryItem.facility_id == f.id)
            .scalar()
        )
        vehicle_count = (
            db.query(func.count(models.Vehicle.id))
            .filter(models.Vehicle.facility_id == f.id)
            .scalar()
        )

        result.append(
            {
                "id": f.id,
                "name": f.name,
                "code": f.code,
                "type": f.type,
                "city": f.city,
                "state": f.state,
                "capacity_percentage": f.capacity_percentage,
                "staff_count": f.staff_count,
                "status": f.status,
                "inventory_items": inventory_count,
                "total_stock": total_stock,
                "vehicles": vehicle_count,
            }
        )

    return result


@router.get("/customer-order-frequency")
def get_customer_order_frequency(
    limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)
):
    """Top customers by order frequency and total value."""
    results = (
        db.query(
            models.Customer.id,
            models.Customer.name,
            func.count(models.Order.id).label("order_count"),
            func.coalesce(func.sum(models.Order.total_value), 0).label("total_value"),
            func.avg(models.Order.total_value).label("avg_order_value"),
        )
        .join(models.Order, models.Customer.id == models.Order.customer_id)
        .group_by(models.Customer.id, models.Customer.name)
        .order_by(func.count(models.Order.id).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "customer_id": cid,
            "customer_name": name,
            "order_count": count,
            "total_value": round(total, 2),
            "avg_order_value": round(avg, 2) if avg else 0,
        }
        for cid, name, count, total, avg in results
    ]


@router.get("/export/csv")
def export_analytics_csv(
    report: str = Query(
        ...,
        description="Report type: delivery-trends, carrier-performance, facility-utilization, customer-order-frequency",
    ),
    db: Session = Depends(get_db),
):
    """Export any analytics report as CSV."""
    if report == "delivery-trends":
        data = get_delivery_trends(days=90, db=db)
        headers = ["week", "total", "delivered", "delayed", "on_time_rate"]
        filename = "delivery_trends.csv"
    elif report == "carrier-performance":
        data = get_carrier_performance(db=db)
        headers = [
            "carrier",
            "total_shipments",
            "delivered",
            "delayed",
            "in_transit",
            "avg_weight",
            "on_time_rate",
        ]
        filename = "carrier_performance.csv"
    elif report == "facility-utilization":
        data = get_facility_utilization(db=db)
        headers = [
            "name",
            "code",
            "type",
            "city",
            "state",
            "capacity_percentage",
            "staff_count",
            "status",
            "inventory_items",
            "total_stock",
            "vehicles",
        ]
        filename = "facility_utilization.csv"
    elif report == "customer-order-frequency":
        data = get_customer_order_frequency(limit=50, db=db)
        headers = ["customer_name", "order_count", "total_value", "avg_order_value"]
        filename = "customer_order_frequency.csv"
    else:
        return {"error": "Invalid report type"}

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=headers, extrasaction="ignore")
    writer.writeheader()
    for row in data:
        writer.writerow(row)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
