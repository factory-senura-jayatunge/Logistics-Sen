from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class Customer(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Facility Schemas
class FacilityBase(BaseModel):
    code: str
    name: str
    type: str
    address: str
    city: str
    state: str
    country: str = "USA"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_percentage: int = 0
    staff_count: int = 0
    status: str = "operational"


class FacilityCreate(FacilityBase):
    pass


class Facility(FacilityBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Order Schemas
class OrderBase(BaseModel):
    customer_id: int
    items_count: int
    total_value: float
    priority: str = "medium"
    status: str = "pending"


class OrderCreate(OrderBase):
    pass


class Order(OrderBase):
    id: int
    order_number: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderWithCustomer(Order):
    customer: Customer


class ShipmentBasic(BaseModel):
    id: int
    tracking_number: str
    origin: str
    destination: str
    carrier: str
    weight_kg: float
    status: str
    eta: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OrderDetail(Order):
    customer: Customer
    shipments: list[ShipmentBasic] = []


# Shipment Schemas
class ShipmentBase(BaseModel):
    customer_id: int
    order_id: Optional[int] = None
    origin: str
    destination: str
    carrier: str
    weight_kg: float
    status: str = "pending"
    eta: Optional[datetime] = None


class ShipmentCreate(ShipmentBase):
    pass


class Shipment(ShipmentBase):
    id: int
    tracking_number: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ShipmentWithCustomer(Shipment):
    customer: Customer


class ShipmentDetail(Shipment):
    customer: Customer
    order: Optional[Order] = None


# Inventory Schemas
class InventoryItemBase(BaseModel):
    sku: str
    name: str
    category: str
    facility_id: int
    quantity: int = 0
    reorder_point: int = 0
    unit_price: float = 0.0
    status: str = "in_stock"


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItem(InventoryItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InventoryItemWithFacility(InventoryItem):
    facility: Facility


# Vehicle Schemas
class VehicleBase(BaseModel):
    vehicle_id: str
    name: str
    type: str
    driver: str
    facility_id: Optional[int] = None
    current_location: str
    destination: Optional[str] = None
    status: str = "idle"
    fuel_level: int = 100
    eta: Optional[str] = None


class VehicleCreate(VehicleBase):
    pass


class Vehicle(VehicleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class VehicleWithFacility(Vehicle):
    facility: Optional[Facility] = None


# Facility Detail (with related items)
class InventoryItemBasic(BaseModel):
    id: int
    sku: str
    name: str
    category: str
    quantity: int
    reorder_point: int
    unit_price: float
    status: str

    class Config:
        from_attributes = True


class VehicleBasic(BaseModel):
    id: int
    vehicle_id: str
    name: str
    type: str
    driver: str
    status: str
    fuel_level: int
    current_location: str

    class Config:
        from_attributes = True


class FacilityDetail(Facility):
    inventory_items: list[InventoryItemBasic] = []
    vehicles: list[VehicleBasic] = []


# User Schemas
class UserBase(BaseModel):
    email: str
    name: str
    role: str
    status: str = "active"


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: Optional[str] = None
    type: str = "info"
    category: str = "system"
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None


class NotificationCreate(NotificationBase):
    user_id: Optional[int] = None


class Notification(NotificationBase):
    id: int
    user_id: Optional[int] = None
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard Stats
class DashboardStats(BaseModel):
    total_shipments: int
    shipments_in_transit: int
    shipments_delivered: int
    shipments_delayed: int
    total_orders: int
    orders_pending: int
    total_inventory_items: int
    low_stock_items: int
    total_vehicles: int
    vehicles_en_route: int
    total_facilities: int


# Search Results
class SearchResult(BaseModel):
    id: int
    type: str  # shipment, order, inventory, customer, vehicle
    title: str
    subtitle: str
    url: str


# Bulk Operation Schemas
class BulkDeleteRequest(BaseModel):
    ids: list[int]


class BulkStatusUpdateRequest(BaseModel):
    ids: list[int]
    status: str


class BulkOperationResult(BaseModel):
    success_count: int
    failed_count: int
    errors: list[dict] = []


class CSVImportResult(BaseModel):
    imported: int
    skipped: int
    errors: list[dict] = []
