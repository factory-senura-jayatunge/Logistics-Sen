from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models

router = APIRouter(prefix="/forecasting", tags=["forecasting"])


@router.get("/demand-forecast")
def get_demand_forecast(
    days_ahead: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
):
    """Predict inventory demand based on historical order patterns."""
    lookback_days = 90
    start_date = datetime.utcnow() - timedelta(days=lookback_days)

    order_rate = (
        db.query(func.count(models.Order.id)).filter(models.Order.created_at >= start_date).scalar()
        or 0
    )

    daily_order_rate = order_rate / lookback_days if lookback_days > 0 else 0

    inventory_items = db.query(models.InventoryItem).all()
    forecasts = []

    for item in inventory_items:
        item_orders = (
            db.query(func.coalesce(func.sum(models.Order.items_count), 0))
            .filter(models.Order.created_at >= start_date)
            .scalar()
            or 0
        )

        daily_demand = item_orders / lookback_days / max(len(inventory_items), 1)
        projected_demand = round(daily_demand * days_ahead, 1)
        days_until_stockout = round(item.quantity / daily_demand, 1) if daily_demand > 0 else 999
        needs_reorder = item.quantity <= item.reorder_point or days_until_stockout <= days_ahead
        suggested_reorder_qty = max(0, round(projected_demand - item.quantity + item.reorder_point))

        forecasts.append(
            {
                "item_id": item.id,
                "sku": item.sku,
                "name": item.name,
                "category": item.category,
                "facility_id": item.facility_id,
                "current_quantity": item.quantity,
                "reorder_point": item.reorder_point,
                "daily_demand_rate": round(daily_demand, 2),
                "projected_demand": projected_demand,
                "days_until_stockout": min(days_until_stockout, 999),
                "needs_reorder": needs_reorder,
                "suggested_reorder_qty": suggested_reorder_qty,
                "risk_level": (
                    "critical"
                    if days_until_stockout <= 7
                    else "warning" if days_until_stockout <= 30 else "normal"
                ),
            }
        )

    forecasts.sort(key=lambda x: x["days_until_stockout"])

    critical_count = sum(1 for f in forecasts if f["risk_level"] == "critical")
    warning_count = sum(1 for f in forecasts if f["risk_level"] == "warning")

    return {
        "forecast_period_days": days_ahead,
        "daily_order_rate": round(daily_order_rate, 2),
        "total_items_tracked": len(forecasts),
        "critical_items": critical_count,
        "warning_items": warning_count,
        "forecasts": forecasts,
    }


@router.get("/stockout-alerts")
def get_stockout_alerts(
    threshold_days: int = Query(14, ge=1, le=90),
    db: Session = Depends(get_db),
):
    """Get items predicted to stock out within threshold days."""
    forecast_data = get_demand_forecast(days_ahead=threshold_days, db=db)
    alerts = [f for f in forecast_data["forecasts"] if f["needs_reorder"]]

    return {
        "threshold_days": threshold_days,
        "total_alerts": len(alerts),
        "alerts": alerts,
    }


@router.get("/reorder-recommendations")
def get_reorder_recommendations(db: Session = Depends(get_db)):
    """Generate reorder recommendations based on demand forecast."""
    forecast_data = get_demand_forecast(days_ahead=30, db=db)
    recommendations = []

    for item in forecast_data["forecasts"]:
        if item["suggested_reorder_qty"] > 0:
            recommendations.append(
                {
                    "item_id": item["item_id"],
                    "sku": item["sku"],
                    "name": item["name"],
                    "facility_id": item["facility_id"],
                    "current_quantity": item["current_quantity"],
                    "suggested_quantity": item["suggested_reorder_qty"],
                    "estimated_cost": round(item["suggested_reorder_qty"] * 10.0, 2),
                    "urgency": item["risk_level"],
                    "days_until_stockout": item["days_until_stockout"],
                }
            )

    recommendations.sort(
        key=lambda x: 0 if x["urgency"] == "critical" else 1 if x["urgency"] == "warning" else 2
    )

    return {
        "total_recommendations": len(recommendations),
        "total_estimated_cost": round(sum(r["estimated_cost"] for r in recommendations), 2),
        "recommendations": recommendations,
    }
