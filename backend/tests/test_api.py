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


class TestOrdersMutations:
    """Tests for order write operations."""

    def test_create_order(self, client):
        """Should create a new order."""
        # First get a customer ID
        customers = client.get("/api/v1/customers").json()
        customer_id = customers[0]["id"] if customers else 1

        order_data = {
            "customer_id": customer_id,
            "items_count": 5,
            "total_value": 299.99,
            "priority": "high",
            "status": "pending",
        }
        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 200
        data = response.json()
        assert data["items_count"] == 5
        assert data["total_value"] == 299.99
        assert data["priority"] == "high"
        assert "order_number" in data

    def test_update_order(self, client):
        """Should update an existing order."""
        # Get existing order
        orders = client.get("/api/v1/orders").json()
        if orders:
            order_id = orders[0]["id"]
            customer_id = orders[0]["customer_id"]
            update_data = {
                "customer_id": customer_id,
                "items_count": 10,
                "total_value": 599.99,
                "priority": "critical",
                "status": "processing",
            }
            response = client.put(f"/api/v1/orders/{order_id}", json=update_data)
            assert response.status_code == 200
            data = response.json()
            assert data["items_count"] == 10
            assert data["priority"] == "critical"

    def test_update_order_status(self, client):
        """Should update order status."""
        orders = client.get("/api/v1/orders").json()
        if orders:
            order_id = orders[0]["id"]
            response = client.patch(f"/api/v1/orders/{order_id}/status?status=shipped")
            assert response.status_code == 200
            assert "shipped" in response.json()["message"]

    def test_delete_order(self, client):
        """Should delete an order."""
        # Create an order to delete
        customers = client.get("/api/v1/customers").json()
        customer_id = customers[0]["id"] if customers else 1
        order_data = {
            "customer_id": customer_id,
            "items_count": 1,
            "total_value": 10.00,
            "priority": "low",
            "status": "pending",
        }
        create_response = client.post("/api/v1/orders", json=order_data)
        order_id = create_response.json()["id"]

        response = client.delete(f"/api/v1/orders/{order_id}")
        assert response.status_code == 200
        assert "deleted" in response.json()["message"]

    def test_get_order_not_found(self, client):
        """Should return 404 for non-existent order."""
        response = client.get("/api/v1/orders/99999")
        assert response.status_code == 404

    def test_update_order_not_found(self, client):
        """Should return 404 when updating non-existent order."""
        update_data = {
            "customer_id": 1,
            "items_count": 1,
            "total_value": 10.00,
            "priority": "low",
            "status": "pending",
        }
        response = client.put("/api/v1/orders/99999", json=update_data)
        assert response.status_code == 404

    def test_delete_order_not_found(self, client):
        """Should return 404 when deleting non-existent order."""
        response = client.delete("/api/v1/orders/99999")
        assert response.status_code == 404


class TestShipmentsMutations:
    """Tests for shipment write operations."""

    def test_create_shipment(self, client):
        """Should create a new shipment."""
        customers = client.get("/api/v1/customers").json()
        customer_id = customers[0]["id"] if customers else 1

        shipment_data = {
            "customer_id": customer_id,
            "origin": "New York, NY",
            "destination": "Los Angeles, CA",
            "carrier": "FedEx",
            "weight_kg": 25.5,
            "status": "pending",
        }
        response = client.post("/api/v1/shipments", json=shipment_data)
        assert response.status_code == 200
        data = response.json()
        assert data["origin"] == "New York, NY"
        assert data["carrier"] == "FedEx"
        assert "tracking_number" in data

    def test_update_shipment(self, client):
        """Should update an existing shipment."""
        shipments = client.get("/api/v1/shipments").json()
        if shipments:
            shipment_id = shipments[0]["id"]
            customer_id = shipments[0]["customer_id"]
            update_data = {
                "customer_id": customer_id,
                "origin": "Chicago, IL",
                "destination": "Miami, FL",
                "carrier": "UPS",
                "weight_kg": 30.0,
                "status": "in_transit",
            }
            response = client.put(f"/api/v1/shipments/{shipment_id}", json=update_data)
            assert response.status_code == 200
            data = response.json()
            assert data["carrier"] == "UPS"
            assert data["status"] == "in_transit"

    def test_update_shipment_status(self, client):
        """Should update shipment status."""
        shipments = client.get("/api/v1/shipments").json()
        if shipments:
            shipment_id = shipments[0]["id"]
            response = client.patch(f"/api/v1/shipments/{shipment_id}/status?status=delivered")
            assert response.status_code == 200
            assert "delivered" in response.json()["message"]

    def test_delete_shipment(self, client):
        """Should delete a shipment."""
        customers = client.get("/api/v1/customers").json()
        customer_id = customers[0]["id"] if customers else 1
        shipment_data = {
            "customer_id": customer_id,
            "origin": "Test Origin",
            "destination": "Test Dest",
            "carrier": "TestCarrier",
            "weight_kg": 1.0,
            "status": "pending",
        }
        create_response = client.post("/api/v1/shipments", json=shipment_data)
        shipment_id = create_response.json()["id"]

        response = client.delete(f"/api/v1/shipments/{shipment_id}")
        assert response.status_code == 200
        assert "deleted" in response.json()["message"]

    def test_get_shipment_not_found(self, client):
        """Should return 404 for non-existent shipment."""
        response = client.get("/api/v1/shipments/99999")
        assert response.status_code == 404

    def test_get_shipment_by_tracking_not_found(self, client):
        """Should return 404 for non-existent tracking number."""
        response = client.get("/api/v1/shipments/tracking/INVALID-TRACKING-123")
        assert response.status_code == 404

    def test_update_shipment_not_found(self, client):
        """Should return 404 when updating non-existent shipment."""
        update_data = {
            "customer_id": 1,
            "origin": "Test",
            "destination": "Test",
            "carrier": "Test",
            "weight_kg": 1.0,
            "status": "pending",
        }
        response = client.put("/api/v1/shipments/99999", json=update_data)
        assert response.status_code == 404

    def test_delete_shipment_not_found(self, client):
        """Should return 404 when deleting non-existent shipment."""
        response = client.delete("/api/v1/shipments/99999")
        assert response.status_code == 404


class TestNotificationsMutations:
    """Tests for notification write operations."""

    def test_create_notification(self, client):
        """Should create a new notification."""
        notification_data = {
            "title": "Test Notification",
            "message": "This is a test message",
            "type": "info",
            "category": "system",
        }
        response = client.post("/api/v1/notifications", json=notification_data)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Notification"
        assert data["type"] == "info"

    def test_mark_notification_as_read(self, client):
        """Should mark notification as read."""
        # Create a notification first
        notification_data = {
            "title": "Read Test",
            "message": "Test",
            "type": "info",
            "category": "system",
        }
        create_response = client.post("/api/v1/notifications", json=notification_data)
        notification_id = create_response.json()["id"]

        response = client.patch(f"/api/v1/notifications/{notification_id}/read")
        assert response.status_code == 200
        assert "read" in response.json()["message"]

    def test_mark_all_notifications_as_read(self, client):
        """Should mark all notifications as read."""
        response = client.patch("/api/v1/notifications/read-all")
        assert response.status_code == 200
        assert "read" in response.json()["message"]

    def test_delete_notification(self, client):
        """Should delete a notification."""
        notification_data = {
            "title": "Delete Test",
            "message": "Test",
            "type": "info",
            "category": "system",
        }
        create_response = client.post("/api/v1/notifications", json=notification_data)
        notification_id = create_response.json()["id"]

        response = client.delete(f"/api/v1/notifications/{notification_id}")
        assert response.status_code == 200
        assert "deleted" in response.json()["message"]

    def test_get_notification_not_found(self, client):
        """Should return 404 for non-existent notification."""
        response = client.get("/api/v1/notifications/99999")
        assert response.status_code == 404

    def test_delete_notification_not_found(self, client):
        """Should return 404 when deleting non-existent notification."""
        response = client.delete("/api/v1/notifications/99999")
        assert response.status_code == 404

    def test_get_unread_count(self, client):
        """Should return unread notification count."""
        response = client.get("/api/v1/notifications/unread-count")
        assert response.status_code == 200
        assert "count" in response.json()


class TestValidationErrors:
    """Tests for validation error scenarios."""

    def test_create_order_missing_required_fields(self, client):
        """Should return 422 for missing required fields."""
        response = client.post("/api/v1/orders", json={})
        assert response.status_code == 422

    def test_create_shipment_missing_required_fields(self, client):
        """Should return 422 for missing required fields."""
        response = client.post("/api/v1/shipments", json={})
        assert response.status_code == 422

    def test_create_order_invalid_data_type(self, client):
        """Should return 422 for invalid data types."""
        order_data = {
            "customer_id": "not-a-number",
            "items_count": "five",
            "total_value": "expensive",
            "priority": "high",
            "status": "pending",
        }
        response = client.post("/api/v1/orders", json=order_data)
        assert response.status_code == 422
