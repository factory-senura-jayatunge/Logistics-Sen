from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[Optional[str]] = mapped_column(String(50))
    address: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    orders: Mapped[List["Order"]] = relationship(back_populates="customer")
    shipments: Mapped[List["Shipment"]] = relationship(back_populates="customer")


class Facility(Base):
    __tablename__ = "facilities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(50))  # warehouse, hub, distribution, port, fulfillment
    address: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(50))
    country: Mapped[str] = mapped_column(String(100), default="USA")
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    capacity_percentage: Mapped[int] = mapped_column(Integer, default=0)
    staff_count: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(
        String(50), default="operational"
    )  # operational, maintenance, offline
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    inventory_items: Mapped[List["InventoryItem"]] = relationship(back_populates="facility")
    vehicles: Mapped[List["Vehicle"]] = relationship(back_populates="facility")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    items_count: Mapped[int] = mapped_column(Integer)
    total_value: Mapped[float] = mapped_column(Float)
    priority: Mapped[str] = mapped_column(
        String(20), default="medium"
    )  # low, medium, high, critical
    status: Mapped[str] = mapped_column(
        String(50), default="pending"
    )  # pending, confirmed, processing, shipped, delivered
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    customer: Mapped["Customer"] = relationship(back_populates="orders")
    shipments: Mapped[List["Shipment"]] = relationship(back_populates="order")


class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tracking_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    order_id: Mapped[Optional[int]] = mapped_column(ForeignKey("orders.id"), nullable=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    origin: Mapped[str] = mapped_column(String(255))
    destination: Mapped[str] = mapped_column(String(255))
    carrier: Mapped[str] = mapped_column(String(100))
    weight_kg: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(
        String(50), default="pending"
    )  # pending, processing, in_transit, delivered, delayed
    eta: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    order: Mapped[Optional["Order"]] = relationship(back_populates="shipments")
    customer: Mapped["Customer"] = relationship(back_populates="shipments")
    checkpoints: Mapped[List["ShipmentCheckpoint"]] = relationship(
        back_populates="shipment",
        order_by="ShipmentCheckpoint.timestamp",
        cascade="all, delete-orphan",
    )


class ShipmentCheckpoint(Base):
    __tablename__ = "shipment_checkpoints"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    shipment_id: Mapped[int] = mapped_column(ForeignKey("shipments.id"), index=True)
    facility_id: Mapped[Optional[int]] = mapped_column(ForeignKey("facilities.id"), nullable=True)
    location_name: Mapped[str] = mapped_column(String(255))
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(50))
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    shipment: Mapped["Shipment"] = relationship(back_populates="checkpoints")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sku: Mapped[str] = mapped_column(String(50), index=True)
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(100))
    facility_id: Mapped[int] = mapped_column(ForeignKey("facilities.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    reorder_point: Mapped[int] = mapped_column(Integer, default=0)
    unit_price: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(
        String(50), default="in_stock"
    )  # in_stock, low_stock, out_of_stock
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    facility: Mapped["Facility"] = relationship(back_populates="inventory_items")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    vehicle_id: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(50))  # truck, ship, plane, train
    driver: Mapped[str] = mapped_column(String(255))
    facility_id: Mapped[Optional[int]] = mapped_column(ForeignKey("facilities.id"), nullable=True)
    current_location: Mapped[str] = mapped_column(String(255))
    destination: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="idle"
    )  # en_route, loading, idle, maintenance, offline
    fuel_level: Mapped[int] = mapped_column(Integer, default=100)
    eta: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    facility: Mapped[Optional["Facility"]] = relationship(back_populates="vehicles")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(
        String(50)
    )  # admin, operations_manager, dispatcher, warehouse_staff, driver
    status: Mapped[str] = mapped_column(String(20), default="active")  # active, inactive
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    notifications: Mapped[List["Notification"]] = relationship(back_populates="user")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(50), default="info")  # info, warning, error, success
    category: Mapped[str] = mapped_column(
        String(50), default="system"
    )  # shipment, order, inventory, vehicle, system
    reference_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    reference_type: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )  # shipment, order, inventory, vehicle
    read: Mapped[bool] = mapped_column(Integer, default=0)  # SQLite doesn't have native boolean
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[Optional["User"]] = relationship(back_populates="notifications")
