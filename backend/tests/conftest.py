import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from main import app

SQLALCHEMY_DATABASE_URL = "sqlite://"


@pytest.fixture(scope="function")
def test_db():
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    db = testing_session_local()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_customer(test_db):
    from app.models.models import Customer

    customer = Customer(name="Test Company", email="test@example.com", phone="555-0100")
    test_db.add(customer)
    test_db.commit()
    test_db.refresh(customer)
    return customer


@pytest.fixture
def sample_facility(test_db):
    from app.models.models import Facility

    facility = Facility(
        code="WH-TEST",
        name="Test Warehouse",
        type="warehouse",
        address="123 Test Street",
        city="Test City",
        state="TS",
        country="USA",
        capacity_percentage=50,
        staff_count=10,
        status="operational",
    )
    test_db.add(facility)
    test_db.commit()
    test_db.refresh(facility)
    return facility


@pytest.fixture
def sample_order(test_db, sample_customer):
    from app.models.models import Order

    order = Order(
        order_number="ORD-TEST-0001",
        customer_id=sample_customer.id,
        items_count=5,
        total_value=150.00,
        priority="medium",
        status="pending",
    )
    test_db.add(order)
    test_db.commit()
    test_db.refresh(order)
    return order


@pytest.fixture
def sample_shipment(test_db, sample_customer, sample_order):
    from app.models.models import Shipment

    shipment = Shipment(
        tracking_number="TRK-TEST-0001",
        customer_id=sample_customer.id,
        order_id=sample_order.id,
        origin="Los Angeles, CA",
        destination="New York, NY",
        carrier="FedEx",
        weight_kg=25.5,
        status="pending",
    )
    test_db.add(shipment)
    test_db.commit()
    test_db.refresh(shipment)
    return shipment


@pytest.fixture
def sample_shipment_checkpoint(test_db, sample_shipment):
    from app.models.models import ShipmentCheckpoint

    checkpoint = ShipmentCheckpoint(
        shipment_id=sample_shipment.id,
        location_name="Chicago, IL",
        latitude=41.8781,
        longitude=-87.6298,
        status="in_transit",
        notes="Arrived at sorting facility",
    )
    test_db.add(checkpoint)
    test_db.commit()
    test_db.refresh(checkpoint)
    return checkpoint


@pytest.fixture
def sample_inventory(test_db, sample_facility):
    from app.models.models import InventoryItem

    item = InventoryItem(
        sku="SKU-TEST-001",
        name="Test Product",
        category="Electronics",
        facility_id=sample_facility.id,
        quantity=100,
        reorder_point=20,
        unit_price=49.99,
        status="in_stock",
    )
    test_db.add(item)
    test_db.commit()
    test_db.refresh(item)
    return item


@pytest.fixture
def sample_vehicle(test_db, sample_facility):
    from app.models.models import Vehicle

    vehicle = Vehicle(
        vehicle_id="VH-TEST-001",
        name="Test Truck",
        type="truck",
        driver="John Driver",
        facility_id=sample_facility.id,
        current_location="Test City, TS",
        status="idle",
        fuel_level=85,
    )
    test_db.add(vehicle)
    test_db.commit()
    test_db.refresh(vehicle)
    return vehicle


@pytest.fixture
def sample_user(test_db):
    from app.models.models import User

    user = User(
        email="user@test.com",
        name="Test User",
        role="operations_manager",
        status="active",
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def sample_notification(test_db, sample_user):
    from app.models.models import Notification

    notification = Notification(
        user_id=sample_user.id,
        title="Test Notification",
        message="This is a test notification",
        type="info",
        category="system",
        read=False,
    )
    test_db.add(notification)
    test_db.commit()
    test_db.refresh(notification)
    return notification
