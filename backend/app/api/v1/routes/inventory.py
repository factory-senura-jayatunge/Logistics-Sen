from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.logging import get_logger
from app.models import models
from app.schemas import schemas

logger = get_logger("inventory")

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("/", response_model=list[schemas.InventoryItemWithFacility])
def get_inventory_items(
    skip: int = 0,
    limit: int = 1000,
    facility_id: Optional[int] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.InventoryItem).options(joinedload(models.InventoryItem.facility))
    if facility_id:
        query = query.filter(models.InventoryItem.facility_id == facility_id)
    if status:
        query = query.filter(models.InventoryItem.status == status)
    if category:
        query = query.filter(models.InventoryItem.category == category)
    return query.offset(skip).limit(limit).all()


@router.get("/low-stock", response_model=list[schemas.InventoryItemWithFacility])
def get_low_stock_items(db: Session = Depends(get_db)):
    return (
        db.query(models.InventoryItem)
        .options(joinedload(models.InventoryItem.facility))
        .filter(models.InventoryItem.status.in_(["low_stock", "out_of_stock"]))
        .all()
    )


@router.get("/{item_id}", response_model=schemas.InventoryItemWithFacility)
def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = (
        db.query(models.InventoryItem)
        .options(joinedload(models.InventoryItem.facility))
        .filter(models.InventoryItem.id == item_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


@router.post("/", response_model=schemas.InventoryItem)
def create_inventory_item(item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    db_item = models.InventoryItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    logger.info("inventory_item_created", item_id=db_item.id, sku=db_item.sku)
    return db_item


@router.put("/{item_id}", response_model=schemas.InventoryItem)
def update_inventory_item(
    item_id: int, item: schemas.InventoryItemCreate, db: Session = Depends(get_db)
):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not db_item:
        logger.warning("inventory_item_not_found", item_id=item_id, action="update")
        raise HTTPException(status_code=404, detail="Inventory item not found")
    for key, value in item.model_dump().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    logger.info("inventory_item_updated", item_id=item_id)
    return db_item


@router.patch("/{item_id}/quantity")
def update_item_quantity(item_id: int, quantity: int = Query(...), db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not db_item:
        logger.warning("inventory_item_not_found", item_id=item_id, action="quantity_update")
        raise HTTPException(status_code=404, detail="Inventory item not found")
    old_quantity = db_item.quantity
    db_item.quantity = quantity
    if quantity == 0:
        db_item.status = "out_of_stock"
    elif quantity <= db_item.reorder_point:
        db_item.status = "low_stock"
    else:
        db_item.status = "in_stock"
    db.commit()
    logger.info(
        "inventory_quantity_changed",
        item_id=item_id,
        old_quantity=old_quantity,
        new_quantity=quantity,
        new_status=db_item.status,
    )
    return {"message": f"Quantity updated to {quantity}", "status": db_item.status}


@router.delete("/{item_id}")
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not db_item:
        logger.warning("inventory_item_not_found", item_id=item_id, action="delete")
        raise HTTPException(status_code=404, detail="Inventory item not found")
    db.delete(db_item)
    db.commit()
    logger.info("inventory_item_deleted", item_id=item_id)
    return {"message": "Inventory item deleted"}
