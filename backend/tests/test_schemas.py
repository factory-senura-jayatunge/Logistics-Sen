"""Tests for Pydantic schemas."""

import pytest
from pydantic import ValidationError

from app.schemas.schemas import (
    CustomerBase,
    CustomerCreate,
    DashboardStats,
    FacilityBase,
    OrderBase,
    ShipmentBase,
)


class TestCustomerSchemas:
    """Tests for Customer schemas."""

    def test_customer_base_valid(self):
        """CustomerBase should accept valid data."""
        customer = CustomerBase(
            name="John Doe",
            email="john@example.com",
            phone="555-1234",
            address="123 Main St",
        )
        assert customer.name == "John Doe"
        assert customer.email == "john@example.com"

    def test_customer_base_minimal(self):
        """CustomerBase should work with only required fields."""
        customer = CustomerBase(name="Jane Doe", email="jane@example.com")
        assert customer.name == "Jane Doe"
        assert customer.phone is None
        assert customer.address is None

    def test_customer_base_missing_required(self):
        """CustomerBase should reject missing required fields."""
        with pytest.raises(ValidationError):
            CustomerBase(name="John Doe")

    def test_customer_create_inherits_base(self):
        """CustomerCreate should inherit from CustomerBase."""
        customer = CustomerCreate(name="Test", email="test@example.com")
        assert customer.name == "Test"


class TestFacilitySchemas:
    """Tests for Facility schemas."""

    def test_facility_base_valid(self):
        """FacilityBase should accept valid data."""
        facility = FacilityBase(
            code="WH-001",
            name="Main Warehouse",
            type="warehouse",
            address="456 Industrial Ave",
            city="Chicago",
            state="IL",
        )
        assert facility.code == "WH-001"
        assert facility.country == "USA"
        assert facility.status == "operational"

    def test_facility_with_coordinates(self):
        """FacilityBase should accept coordinates."""
        facility = FacilityBase(
            code="HUB-001",
            name="Central Hub",
            type="hub",
            address="789 Logistics Blvd",
            city="Dallas",
            state="TX",
            latitude=32.7767,
            longitude=-96.7970,
        )
        assert facility.latitude == 32.7767
        assert facility.longitude == -96.7970


class TestOrderSchemas:
    """Tests for Order schemas."""

    def test_order_base_valid(self):
        """OrderBase should accept valid data."""
        order = OrderBase(
            customer_id=1,
            items_count=5,
            total_value=250.00,
        )
        assert order.customer_id == 1
        assert order.priority == "medium"
        assert order.status == "pending"

    def test_order_with_priority(self):
        """OrderBase should accept custom priority."""
        order = OrderBase(
            customer_id=1,
            items_count=10,
            total_value=1000.00,
            priority="critical",
            status="processing",
        )
        assert order.priority == "critical"
        assert order.status == "processing"


class TestShipmentSchemas:
    """Tests for Shipment schemas."""

    def test_shipment_base_valid(self):
        """ShipmentBase should accept valid data."""
        shipment = ShipmentBase(
            customer_id=1,
            origin="Chicago, IL",
            destination="New York, NY",
            carrier="FedEx",
            weight_kg=25.5,
        )
        assert shipment.origin == "Chicago, IL"
        assert shipment.status == "pending"
        assert shipment.order_id is None

    def test_shipment_with_order(self):
        """ShipmentBase should accept order_id."""
        shipment = ShipmentBase(
            customer_id=1,
            order_id=100,
            origin="LA",
            destination="SF",
            carrier="UPS",
            weight_kg=10.0,
            status="in_transit",
        )
        assert shipment.order_id == 100
        assert shipment.status == "in_transit"


class TestDashboardStats:
    """Tests for DashboardStats schema."""

    def test_dashboard_stats_valid(self):
        """DashboardStats should accept valid data."""
        stats = DashboardStats(
            total_shipments=100,
            shipments_in_transit=25,
            shipments_delivered=60,
            shipments_delayed=5,
            total_orders=80,
            orders_pending=15,
            total_inventory_items=500,
            low_stock_items=10,
            total_vehicles=20,
            vehicles_en_route=8,
            total_facilities=5,
            total_orders_shipped_this_year=42,
        )
        assert stats.total_shipments == 100
        assert stats.shipments_in_transit == 25
        assert stats.total_facilities == 5
