from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.logging import get_logger
from app.models import models
from app.schemas import schemas
from app.ws.manager import ws_manager

logger = get_logger("shipments")

router = APIRouter(prefix="/shipments", tags=["shipments"])


@router.get("/", response_model=list[schemas.ShipmentWithCustomer])
def get_shipments(
    skip: int = 0, limit: int = 100, status: Optional[str] = None, db: Session = Depends(get_db)
):
    query = db.query(models.Shipment).options(joinedload(models.Shipment.customer))
    if status:
        query = query.filter(models.Shipment.status == status)
    return query.order_by(models.Shipment.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{shipment_id}", response_model=schemas.ShipmentDetail)
def get_shipment(shipment_id: int, db: Session = Depends(get_db)):
    shipment = (
        db.query(models.Shipment)
        .options(
            joinedload(models.Shipment.customer),
            joinedload(models.Shipment.order),
            joinedload(models.Shipment.checkpoints),
        )
        .filter(models.Shipment.id == shipment_id)
        .first()
    )
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment


@router.get("/{shipment_id}/checkpoints", response_model=list[schemas.ShipmentCheckpoint])
def get_shipment_checkpoints(shipment_id: int, db: Session = Depends(get_db)):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    return (
        db.query(models.ShipmentCheckpoint)
        .filter(models.ShipmentCheckpoint.shipment_id == shipment_id)
        .order_by(models.ShipmentCheckpoint.timestamp.asc())
        .all()
    )


@router.post("/{shipment_id}/checkpoints", response_model=schemas.ShipmentCheckpoint)
def create_shipment_checkpoint(
    shipment_id: int,
    checkpoint: schemas.ShipmentCheckpointCreate,
    db: Session = Depends(get_db),
):
    shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")

    db_checkpoint = models.ShipmentCheckpoint(
        shipment_id=shipment_id,
        **checkpoint.model_dump(),
    )
    db.add(db_checkpoint)
    db.commit()
    db.refresh(db_checkpoint)
    logger.info(
        "shipment_checkpoint_created",
        shipment_id=shipment_id,
        checkpoint_id=db_checkpoint.id,
        status=db_checkpoint.status,
        location_name=db_checkpoint.location_name,
    )
    return db_checkpoint


@router.get("/tracking/{tracking_number}", response_model=schemas.ShipmentWithCustomer)
def get_shipment_by_tracking(tracking_number: str, db: Session = Depends(get_db)):
    shipment = (
        db.query(models.Shipment)
        .options(joinedload(models.Shipment.customer))
        .filter(models.Shipment.tracking_number == tracking_number)
        .first()
    )
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment


@router.post("/", response_model=schemas.Shipment)
def create_shipment(shipment: schemas.ShipmentCreate, db: Session = Depends(get_db)):
    shipment_count = db.query(models.Shipment).count()
    tracking_number = f"SHP-2024-{shipment_count + 1001:04d}"
    db_shipment = models.Shipment(**shipment.model_dump(), tracking_number=tracking_number)
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    logger.info(
        "shipment_created",
        shipment_id=db_shipment.id,
        tracking_number=tracking_number,
        origin=shipment.origin,
        destination=shipment.destination,
    )
    return db_shipment


@router.put("/{shipment_id}", response_model=schemas.Shipment)
def update_shipment(
    shipment_id: int, shipment: schemas.ShipmentCreate, db: Session = Depends(get_db)
):
    db_shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not db_shipment:
        logger.warning("shipment_not_found", shipment_id=shipment_id, action="update")
        raise HTTPException(status_code=404, detail="Shipment not found")
    for key, value in shipment.model_dump().items():
        setattr(db_shipment, key, value)
    db.commit()
    db.refresh(db_shipment)
    logger.info("shipment_updated", shipment_id=shipment_id)
    return db_shipment


@router.patch("/{shipment_id}/status")
async def update_shipment_status(
    shipment_id: int, status: str = Query(...), db: Session = Depends(get_db)
):
    db_shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not db_shipment:
        logger.warning("shipment_not_found", shipment_id=shipment_id, action="status_update")
        raise HTTPException(status_code=404, detail="Shipment not found")
    old_status = db_shipment.status
    db_shipment.status = status
    db.commit()
    logger.info(
        "shipment_status_changed",
        shipment_id=shipment_id,
        old_status=old_status,
        new_status=status,
    )
    await ws_manager.broadcast_status_update(
        shipment_id,
        {
            "type": "status_update",
            "shipment_id": shipment_id,
            "old_status": old_status,
            "new_status": status,
            "tracking_number": db_shipment.tracking_number,
        },
    )
    return {"message": f"Shipment status updated to {status}"}


@router.delete("/{shipment_id}")
def delete_shipment(shipment_id: int, db: Session = Depends(get_db)):
    db_shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not db_shipment:
        logger.warning("shipment_not_found", shipment_id=shipment_id, action="delete")
        raise HTTPException(status_code=404, detail="Shipment not found")
    db.delete(db_shipment)
    db.commit()
    logger.info("shipment_deleted", shipment_id=shipment_id)
    return {"message": "Shipment deleted"}
