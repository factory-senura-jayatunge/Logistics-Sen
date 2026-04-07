from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.logging import get_logger
from app.models import models
from app.schemas import schemas

logger = get_logger("customers")

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/", response_model=list[schemas.Customer])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Customer).offset(skip).limit(limit).all()


@router.get("/{customer_id}", response_model=schemas.CustomerDetail)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).options(
        joinedload(models.Customer.orders),
        joinedload(models.Customer.shipments)
    ).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_spent = sum(order.total_value for order in customer.orders)

    return schemas.CustomerDetail(
        id=customer.id,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        address=customer.address,
        created_at=customer.created_at,
        orders=sorted(customer.orders, key=lambda x: x.created_at, reverse=True)[:10],
        shipments=sorted(customer.shipments, key=lambda x: x.created_at, reverse=True)[:10],
        total_orders=len(customer.orders),
        total_spent=total_spent,
        total_shipments=len(customer.shipments)
    )


@router.get("/{customer_id}/orders", response_model=list[schemas.OrderBasic])
def get_customer_orders(
    customer_id: int,
    exclude_order_id: int = Query(None, description="Order ID to exclude from results"),
    limit: int = Query(5, description="Maximum number of orders to return"),
    db: Session = Depends(get_db)
):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    query = db.query(models.Order).filter(models.Order.customer_id == customer_id)
    if exclude_order_id:
        query = query.filter(models.Order.id != exclude_order_id)

    return query.order_by(models.Order.created_at.desc()).limit(limit).all()


@router.post("/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    logger.info("customer_created", customer_id=db_customer.id, email=db_customer.email)
    return db_customer


@router.put("/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: int, customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        logger.warning("customer_not_found", customer_id=customer_id, action="update")
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in customer.model_dump().items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    logger.info("customer_updated", customer_id=customer_id)
    return db_customer


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        logger.warning("customer_not_found", customer_id=customer_id, action="delete")
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    logger.info("customer_deleted", customer_id=customer_id)
    return {"message": "Customer deleted"}
