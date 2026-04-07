from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.logging import get_logger
from app.models import models
from app.schemas import schemas

logger = get_logger("orders")

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/", response_model=list[schemas.OrderWithCustomer])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Order).options(joinedload(models.Order.customer))
    if status:
        query = query.filter(models.Order.status == status)
    if priority:
        query = query.filter(models.Order.priority == priority)
    return query.order_by(models.Order.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=schemas.OrderDetail)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.customer), joinedload(models.Order.shipments))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    order_count = db.query(models.Order).count()
    order_number = f"ORD-2024-{order_count + 1001:04d}"
    db_order = models.Order(**order.model_dump(), order_number=order_number)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    logger.info("order_created", order_id=db_order.id, order_number=order_number)
    return db_order


@router.put("/{order_id}", response_model=schemas.Order)
def update_order(order_id: int, order: schemas.OrderCreate, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        logger.warning("order_not_found", order_id=order_id, action="update")
        raise HTTPException(status_code=404, detail="Order not found")
    for key, value in order.model_dump().items():
        setattr(db_order, key, value)
    db.commit()
    db.refresh(db_order)
    logger.info("order_updated", order_id=order_id)
    return db_order


@router.patch("/{order_id}/status")
def update_order_status(order_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        logger.warning("order_not_found", order_id=order_id, action="status_update")
        raise HTTPException(status_code=404, detail="Order not found")
    old_status = db_order.status
    db_order.status = status
    db.commit()
    logger.info("order_status_changed", order_id=order_id, old_status=old_status, new_status=status)
    return {"message": f"Order status updated to {status}"}


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        logger.warning("order_not_found", order_id=order_id, action="delete")
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
    logger.info("order_deleted", order_id=order_id)
    return {"message": "Order deleted"}
