from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.logging import get_logger
from app.models import models
from app.schemas import schemas

logger = get_logger("vehicles")

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.get("/", response_model=list[schemas.Vehicle])
def get_vehicles(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Vehicle)
    if type:
        query = query.filter(models.Vehicle.type == type)
    if status:
        query = query.filter(models.Vehicle.status == status)
    return query.offset(skip).limit(limit).all()


@router.get("/{vehicle_id}", response_model=schemas.VehicleWithFacility)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = (
        db.query(models.Vehicle)
        .options(joinedload(models.Vehicle.facility))
        .filter(models.Vehicle.id == vehicle_id)
        .first()
    )
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("/", response_model=schemas.Vehicle)
def create_vehicle(vehicle: schemas.VehicleCreate, db: Session = Depends(get_db)):
    db_vehicle = models.Vehicle(**vehicle.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    logger.info("vehicle_created", vehicle_id=db_vehicle.id, vehicle_code=db_vehicle.vehicle_id)
    return db_vehicle


@router.put("/{vehicle_id}", response_model=schemas.Vehicle)
def update_vehicle(vehicle_id: int, vehicle: schemas.VehicleCreate, db: Session = Depends(get_db)):
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        logger.warning("vehicle_not_found", vehicle_id=vehicle_id, action="update")
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for key, value in vehicle.model_dump().items():
        setattr(db_vehicle, key, value)
    db.commit()
    db.refresh(db_vehicle)
    logger.info("vehicle_updated", vehicle_id=vehicle_id)
    return db_vehicle


@router.patch("/{vehicle_id}/status")
def update_vehicle_status(vehicle_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        logger.warning("vehicle_not_found", vehicle_id=vehicle_id, action="status_update")
        raise HTTPException(status_code=404, detail="Vehicle not found")
    old_status = db_vehicle.status
    db_vehicle.status = status
    db.commit()
    logger.info(
        "vehicle_status_changed",
        vehicle_id=vehicle_id,
        old_status=old_status,
        new_status=status,
    )
    return {"message": f"Vehicle status updated to {status}"}


@router.patch("/{vehicle_id}/location")
def update_vehicle_location(
    vehicle_id: int,
    location: str = Query(...),
    destination: Optional[str] = None,
    eta: Optional[str] = None,
    db: Session = Depends(get_db),
):
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        logger.warning("vehicle_not_found", vehicle_id=vehicle_id, action="location_update")
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db_vehicle.current_location = location
    if destination is not None:
        db_vehicle.destination = destination
    if eta is not None:
        db_vehicle.eta = eta
    db.commit()
    logger.info("vehicle_location_updated", vehicle_id=vehicle_id, location=location)
    return {"message": "Vehicle location updated"}


@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    db_vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        logger.warning("vehicle_not_found", vehicle_id=vehicle_id, action="delete")
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(db_vehicle)
    db.commit()
    logger.info("vehicle_deleted", vehicle_id=vehicle_id)
    return {"message": "Vehicle deleted"}
