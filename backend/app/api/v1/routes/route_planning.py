import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models

router = APIRouter(prefix="/routes", tags=["route-planning"])


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_radius_km = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))
    return earth_radius_km * c


def nearest_neighbor_route(locations: list[dict]) -> list[dict]:
    """Nearest-neighbor TSP heuristic for route optimization."""
    if len(locations) <= 1:
        return locations

    unvisited = list(range(1, len(locations)))
    route = [0]
    current = 0

    while unvisited:
        nearest = min(
            unvisited,
            key=lambda i: haversine(
                locations[current]["latitude"],
                locations[current]["longitude"],
                locations[i]["latitude"],
                locations[i]["longitude"],
            ),
        )
        route.append(nearest)
        unvisited.remove(nearest)
        current = nearest

    ordered = [locations[i] for i in route]
    total_distance = 0.0
    for i in range(len(ordered) - 1):
        total_distance += haversine(
            ordered[i]["latitude"],
            ordered[i]["longitude"],
            ordered[i + 1]["latitude"],
            ordered[i + 1]["longitude"],
        )

    for idx, loc in enumerate(ordered):
        loc["stop_order"] = idx + 1
    return ordered, round(total_distance, 2)


@router.get("/optimize")
def optimize_route(
    vehicle_id: int = Query(..., description="Vehicle ID to plan route for"),
    db: Session = Depends(get_db),
):
    """Generate optimized delivery route for a vehicle based on pending shipments."""
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        return {"error": "Vehicle not found"}

    pending_shipments = (
        db.query(models.Shipment)
        .filter(models.Shipment.status.in_(["pending", "processing"]))
        .limit(10)
        .all()
    )

    if not pending_shipments:
        return {
            "vehicle": vehicle.name,
            "stops": [],
            "total_distance_km": 0,
            "message": "No pending shipments to route",
        }

    facilities = (
        db.query(models.Facility)
        .filter(
            models.Facility.latitude.isnot(None),
            models.Facility.longitude.isnot(None),
        )
        .all()
    )

    facility_lookup = {}
    for f in facilities:
        facility_lookup[f.city.lower()] = {
            "latitude": f.latitude,
            "longitude": f.longitude,
            "name": f.name,
            "code": f.code,
        }

    stops = []
    if vehicle.facility:
        stops.append(
            {
                "type": "origin",
                "name": vehicle.facility.name,
                "location": vehicle.current_location,
                "latitude": vehicle.facility.latitude or 39.8283,
                "longitude": vehicle.facility.longitude or -98.5795,
                "shipment_id": None,
                "tracking_number": None,
            }
        )
    else:
        stops.append(
            {
                "type": "origin",
                "name": "Current Location",
                "location": vehicle.current_location,
                "latitude": 39.8283,
                "longitude": -98.5795,
                "shipment_id": None,
                "tracking_number": None,
            }
        )

    for shipment in pending_shipments:
        dest_city = shipment.destination.split(",")[0].strip().lower()
        coords = facility_lookup.get(dest_city, None)
        if coords:
            lat, lon = coords["latitude"], coords["longitude"]
        else:
            lat, lon = 39.8283 + len(stops) * 0.5, -98.5795 + len(stops) * 0.5

        stops.append(
            {
                "type": "delivery",
                "name": f"Deliver {shipment.tracking_number}",
                "location": shipment.destination,
                "latitude": lat,
                "longitude": lon,
                "shipment_id": shipment.id,
                "tracking_number": shipment.tracking_number,
            }
        )

    optimized_stops, total_distance = nearest_neighbor_route(stops)
    avg_speed_kmh = 80
    estimated_hours = round(total_distance / avg_speed_kmh, 1) if total_distance > 0 else 0

    return {
        "vehicle": {
            "id": vehicle.id,
            "name": vehicle.name,
            "vehicle_id": vehicle.vehicle_id,
            "driver": vehicle.driver,
            "type": vehicle.type,
        },
        "stops": optimized_stops,
        "total_distance_km": total_distance,
        "estimated_hours": estimated_hours,
        "total_stops": len(optimized_stops),
    }


@router.get("/dispatch-summary")
def get_dispatch_summary(db: Session = Depends(get_db)):
    """Get dispatch overview: available vehicles, pending shipments by region."""
    available_vehicles = (
        db.query(models.Vehicle).filter(models.Vehicle.status.in_(["idle", "loading"])).all()
    )

    pending_shipments = (
        db.query(models.Shipment)
        .filter(models.Shipment.status.in_(["pending", "processing"]))
        .all()
    )

    regions = {}
    for s in pending_shipments:
        parts = s.destination.split(",")
        region = parts[-1].strip() if len(parts) > 1 else s.destination
        if region not in regions:
            regions[region] = {"count": 0, "total_weight_kg": 0.0, "shipments": []}
        regions[region]["count"] += 1
        regions[region]["total_weight_kg"] += s.weight_kg
        regions[region]["shipments"].append(
            {
                "id": s.id,
                "tracking_number": s.tracking_number,
                "destination": s.destination,
                "weight_kg": s.weight_kg,
            }
        )

    return {
        "available_vehicles": [
            {
                "id": v.id,
                "vehicle_id": v.vehicle_id,
                "name": v.name,
                "type": v.type,
                "driver": v.driver,
                "current_location": v.current_location,
                "fuel_level": v.fuel_level,
            }
            for v in available_vehicles
        ],
        "pending_shipments_count": len(pending_shipments),
        "regions": [
            {"region": region, **data}
            for region, data in sorted(regions.items(), key=lambda x: x[1]["count"], reverse=True)
        ],
    }
