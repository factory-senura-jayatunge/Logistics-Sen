from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/facilities", tags=["facilities"])


@router.get("/", response_model=list[schemas.Facility])
def get_facilities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Facility).offset(skip).limit(limit).all()


@router.get("/{facility_id}", response_model=schemas.FacilityDetail)
def get_facility(facility_id: int, db: Session = Depends(get_db)):
    facility = db.query(models.Facility).options(
        joinedload(models.Facility.inventory_items),
        joinedload(models.Facility.vehicles)
    ).filter(models.Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    return facility


@router.post("/", response_model=schemas.Facility)
def create_facility(facility: schemas.FacilityCreate, db: Session = Depends(get_db)):
    db_facility = models.Facility(**facility.model_dump())
    db.add(db_facility)
    db.commit()
    db.refresh(db_facility)
    return db_facility


@router.put("/{facility_id}", response_model=schemas.Facility)
def update_facility(facility_id: int, facility: schemas.FacilityCreate, db: Session = Depends(get_db)):
    db_facility = db.query(models.Facility).filter(models.Facility.id == facility_id).first()
    if not db_facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    for key, value in facility.model_dump().items():
        setattr(db_facility, key, value)
    db.commit()
    db.refresh(db_facility)
    return db_facility


@router.delete("/{facility_id}")
def delete_facility(facility_id: int, db: Session = Depends(get_db)):
    db_facility = db.query(models.Facility).filter(models.Facility.id == facility_id).first()
    if not db_facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    db.delete(db_facility)
    db.commit()
    return {"message": "Facility deleted"}
