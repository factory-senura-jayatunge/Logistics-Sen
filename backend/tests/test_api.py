"""Tests for the FastAPI application."""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


class TestHealthEndpoint:
    """Tests for the health check endpoint."""

    def test_health_check_returns_healthy(self, client):
        """Health endpoint should return healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestRootEndpoint:
    """Tests for the root endpoint."""

    def test_root_returns_api_info(self, client):
        """Root endpoint should return API information."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Acme Logistics API"
        assert data["version"] == "1.0.0"
        assert data["docs"] == "/docs"


class TestDashboardEndpoints:
    """Tests for dashboard endpoints."""

    def test_dashboard_stats_returns_data(self, client):
        """Dashboard stats endpoint should return statistics."""
        response = client.get("/api/v1/dashboard/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_shipments" in data
        assert "total_orders" in data
        assert "total_facilities" in data
        assert "total_vehicles" in data

    def test_recent_shipments_returns_list(self, client):
        """Recent shipments endpoint should return a list."""
        response = client.get("/api/v1/dashboard/recent-shipments")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_shipment_status_breakdown_returns_data(self, client):
        """Shipment status breakdown should return status counts."""
        response = client.get("/api/v1/dashboard/shipment-status-breakdown")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestCustomersEndpoints:
    """Tests for customer endpoints."""

    def test_list_customers_returns_list(self, client):
        """Customers endpoint should return a list."""
        response = client.get("/api/v1/customers")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_customers_with_pagination(self, client):
        """Customers endpoint should support pagination."""
        response = client.get("/api/v1/customers?skip=0&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 5


class TestFacilitiesEndpoints:
    """Tests for facility endpoints."""

    def test_list_facilities_returns_list(self, client):
        """Facilities endpoint should return a list."""
        response = client.get("/api/v1/facilities")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestOrdersEndpoints:
    """Tests for order endpoints."""

    def test_list_orders_returns_list(self, client):
        """Orders endpoint should return a list."""
        response = client.get("/api/v1/orders")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestShipmentsEndpoints:
    """Tests for shipment endpoints."""

    def test_list_shipments_returns_list(self, client):
        """Shipments endpoint should return a list."""
        response = client.get("/api/v1/shipments")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestInventoryEndpoints:
    """Tests for inventory endpoints."""

    def test_list_inventory_returns_list(self, client):
        """Inventory endpoint should return a list."""
        response = client.get("/api/v1/inventory")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_low_stock_returns_list(self, client):
        """Low stock endpoint should return a list."""
        response = client.get("/api/v1/inventory/low-stock")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestVehiclesEndpoints:
    """Tests for vehicle endpoints."""

    def test_list_vehicles_returns_list(self, client):
        """Vehicles endpoint should return a list."""
        response = client.get("/api/v1/vehicles")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestUsersEndpoints:
    """Tests for user endpoints."""

    def test_list_users_returns_list(self, client):
        """Users endpoint should return a list."""
        response = client.get("/api/v1/users")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestSearchEndpoint:
    """Tests for search endpoint."""

    def test_search_with_query(self, client):
        """Search endpoint should accept query parameter."""
        response = client.get("/api/v1/search?q=test")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_search_requires_query(self, client):
        """Search endpoint should require query parameter."""
        response = client.get("/api/v1/search")
        assert response.status_code == 422
