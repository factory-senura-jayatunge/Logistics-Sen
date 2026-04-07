from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/", response_model=list[schemas.SearchResult])
def search(q: str = Query(..., min_length=1), limit: int = 10, db: Session = Depends(get_db)):
    results = []
    search_term = f"%{q.lower()}%"

    # Search shipments
    shipments = (
        db.query(models.Shipment)
        .filter(
            or_(
                models.Shipment.tracking_number.ilike(search_term),
                models.Shipment.origin.ilike(search_term),
                models.Shipment.destination.ilike(search_term),
                models.Shipment.carrier.ilike(search_term),
            )
        )
        .limit(limit)
        .all()
    )

    for s in shipments:
        results.append(
            schemas.SearchResult(
                id=s.id,
                type="shipment",
                title=s.tracking_number,
                subtitle=f"{s.origin} → {s.destination} • {s.status}",
                url=f"/shipments/{s.id}",
            )
        )

    # Search orders
    orders = (
        db.query(models.Order)
        .filter(models.Order.order_number.ilike(search_term))
        .limit(limit)
        .all()
    )

    for o in orders:
        results.append(
            schemas.SearchResult(
                id=o.id,
                type="order",
                title=o.order_number,
                subtitle=f"{o.items_count} items • ${o.total_value:,.0f} • {o.status}",
                url=f"/orders/{o.id}",
            )
        )

    # Search customers
    customers = (
        db.query(models.Customer)
        .filter(
            or_(
                models.Customer.name.ilike(search_term),
                models.Customer.email.ilike(search_term),
            )
        )
        .limit(limit)
        .all()
    )

    for c in customers:
        results.append(
            schemas.SearchResult(
                id=c.id, type="customer", title=c.name, subtitle=c.email, url=f"/customers/{c.id}"
            )
        )

    # Search inventory
    inventory = (
        db.query(models.InventoryItem)
        .filter(
            or_(
                models.InventoryItem.sku.ilike(search_term),
                models.InventoryItem.name.ilike(search_term),
                models.InventoryItem.category.ilike(search_term),
            )
        )
        .limit(limit)
        .all()
    )

    for i in inventory:
        results.append(
            schemas.SearchResult(
                id=i.id,
                type="inventory",
                title=f"{i.sku} - {i.name}",
                subtitle=f"{i.category} • {i.quantity} units • {i.status}",
                url=f"/inventory/{i.id}",
            )
        )

    # Search vehicles
    vehicles = (
        db.query(models.Vehicle)
        .filter(
            or_(
                models.Vehicle.vehicle_id.ilike(search_term),
                models.Vehicle.name.ilike(search_term),
                models.Vehicle.driver.ilike(search_term),
            )
        )
        .limit(limit)
        .all()
    )

    for v in vehicles:
        results.append(
            schemas.SearchResult(
                id=v.id,
                type="vehicle",
                title=f"{v.vehicle_id} - {v.name}",
                subtitle=f"{v.driver} • {v.status}",
                url=f"/fleet/{v.id}",
            )
        )

    # Search facilities
    facilities = (
        db.query(models.Facility)
        .filter(
            or_(
                models.Facility.code.ilike(search_term),
                models.Facility.name.ilike(search_term),
                models.Facility.city.ilike(search_term),
            )
        )
        .limit(limit)
        .all()
    )

    for f in facilities:
        results.append(
            schemas.SearchResult(
                id=f.id,
                type="facility",
                title=f"{f.code} - {f.name}",
                subtitle=f"{f.city}, {f.state} • {f.type}",
                url=f"/facilities/{f.id}",
            )
        )

    # Sort by relevance (exact matches first) and limit total results
    def sort_key(r):
        title_lower = r.title.lower()
        q_lower = q.lower()
        if title_lower == q_lower:
            return 0
        if title_lower.startswith(q_lower):
            return 1
        return 2

    results.sort(key=sort_key)
    return results[:limit]
