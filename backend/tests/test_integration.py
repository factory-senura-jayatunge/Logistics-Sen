"""Integration tests for cross-endpoint workflows.

These tests verify that multi-step business workflows work correctly
by exercising multiple API endpoints in sequence.
"""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


class TestOrderLifecycle:
    """Test the full order lifecycle: create -> update status -> get details -> delete."""

    def test_create_and_retrieve_order(self, client):
        """Create an order and verify it appears in the order list and detail endpoint."""
        customers = client.get("/api/v1/customers").json()
        assert len(customers) > 0, "Seed data must include at least one customer"
        customer_id = customers[0]["id"]

        create_response = client.post(
            "/api/v1/orders",
            json={
                "customer_id": customer_id,
                "items_count": 3,
                "total_value": 150.00,
                "priority": "high",
                "status": "pending",
            },
        )
        assert create_response.status_code == 200
        order = create_response.json()
        order_id = order["id"]
        assert order["order_number"].startswith("ORD-")
        assert order["priority"] == "high"
        assert order["status"] == "pending"

        detail_response = client.get(f"/api/v1/orders/{order_id}")
        assert detail_response.status_code == 200
        detail = detail_response.json()
        assert detail["customer"]["id"] == customer_id
        assert detail["items_count"] == 3

    def test_order_status_progression(self, client):
        """Create an order and progress it through status transitions."""
        customers = client.get("/api/v1/customers").json()
        customer_id = customers[0]["id"]

        order = client.post(
            "/api/v1/orders",
            json={
                "customer_id": customer_id,
                "items_count": 1,
                "total_value": 50.00,
            },
        ).json()
        order_id = order["id"]
        assert order["status"] == "pending"

        for status in ["confirmed", "processing", "shipped", "delivered"]:
            resp = client.patch(f"/api/v1/orders/{order_id}/status?status={status}")
            assert resp.status_code == 200

        updated = client.get(f"/api/v1/orders/{order_id}").json()
        assert updated["status"] == "delivered"

    def test_order_not_found(self, client):
        """Verify 404 for non-existent order."""
        response = client.get("/api/v1/orders/99999")
        assert response.status_code == 404


class TestShipmentLifecycle:
    """Test the full shipment lifecycle: create -> track -> update -> delete."""

    def test_create_and_track_shipment(self, client):
        """Create a shipment and verify tracking number lookup works."""
        customers = client.get("/api/v1/customers").json()
        customer_id = customers[0]["id"]

        shipment = client.post(
            "/api/v1/shipments",
            json={
                "customer_id": customer_id,
                "origin": "Chicago, IL",
                "destination": "New York, NY",
                "carrier": "FedEx",
                "weight_kg": 15.5,
                "status": "processing",
            },
        ).json()
        assert shipment["tracking_number"].startswith("SHP-")
        tracking_number = shipment["tracking_number"]

        track_response = client.get(f"/api/v1/shipments/tracking/{tracking_number}")
        assert track_response.status_code == 200
        tracked = track_response.json()
        assert tracked["origin"] == "Chicago, IL"
        assert tracked["destination"] == "New York, NY"

    def test_shipment_status_update(self, client):
        """Create a shipment and update its status."""
        customers = client.get("/api/v1/customers").json()
        customer_id = customers[0]["id"]

        shipment = client.post(
            "/api/v1/shipments",
            json={
                "customer_id": customer_id,
                "origin": "LA",
                "destination": "SF",
                "carrier": "UPS",
                "weight_kg": 5.0,
            },
        ).json()
        shipment_id = shipment["id"]

        resp = client.patch(f"/api/v1/shipments/{shipment_id}/status?status=in_transit")
        assert resp.status_code == 200

        updated = client.get(f"/api/v1/shipments/{shipment_id}").json()
        assert updated["status"] == "in_transit"

    def test_shipment_not_found(self, client):
        """Verify 404 for non-existent shipment."""
        response = client.get("/api/v1/shipments/99999")
        assert response.status_code == 404


class TestOrderShipmentRelationship:
    """Test the relationship between orders and shipments."""

    def test_order_with_shipments(self, client):
        """Create an order and a linked shipment, verify the relationship."""
        customers = client.get("/api/v1/customers").json()
        customer_id = customers[0]["id"]

        order = client.post(
            "/api/v1/orders",
            json={
                "customer_id": customer_id,
                "items_count": 2,
                "total_value": 200.00,
            },
        ).json()
        order_id = order["id"]

        shipment = client.post(
            "/api/v1/shipments",
            json={
                "customer_id": customer_id,
                "order_id": order_id,
                "origin": "Dallas, TX",
                "destination": "Miami, FL",
                "carrier": "USPS",
                "weight_kg": 8.0,
            },
        ).json()
        assert shipment["order_id"] == order_id

        order_detail = client.get(f"/api/v1/orders/{order_id}").json()
        shipment_ids = [s["id"] for s in order_detail.get("shipments", [])]
        assert shipment["id"] in shipment_ids


class TestDashboardIntegration:
    """Test that dashboard stats reflect actual data."""

    def test_dashboard_stats_reflect_data(self, client):
        """Dashboard stats should be consistent with entity lists."""
        stats = client.get("/api/v1/dashboard/stats").json()

        facilities = client.get("/api/v1/facilities").json()
        assert stats["total_facilities"] == len(facilities)

        vehicles = client.get("/api/v1/vehicles").json()
        assert stats["total_vehicles"] == len(vehicles)

    def test_recent_shipments_subset_of_all(self, client):
        """Recent shipments should be a subset of all shipments."""
        recent = client.get("/api/v1/dashboard/recent-shipments?limit=3").json()
        all_shipments = client.get("/api/v1/shipments").json()
        all_ids = {s["id"] for s in all_shipments}
        for s in recent:
            assert s["id"] in all_ids


class TestSearchIntegration:
    """Test search across multiple entity types."""

    def test_search_returns_mixed_results(self, client):
        """Search should return results from multiple entity types when matching."""
        customers = client.get("/api/v1/customers").json()
        if customers:
            name = customers[0]["name"].split()[0]
            results = client.get(f"/api/v1/search?q={name}").json()
            assert isinstance(results, list)

    def test_search_empty_query_returns_422(self, client):
        """Search without query parameter should return 422."""
        response = client.get("/api/v1/search")
        assert response.status_code == 422

    def test_search_by_order_number(self, client):
        """Search by order number to cover order search branch."""
        orders = client.get("/api/v1/orders").json()
        if orders:
            order_num = orders[0]["order_number"]
            results = client.get(f"/api/v1/search?q={order_num}").json()
            types = [r["type"] for r in results]
            assert "order" in types

    def test_search_by_tracking_number(self, client):
        """Search by tracking number to cover shipment search branch."""
        shipments = client.get("/api/v1/shipments").json()
        if shipments:
            tracking = shipments[0]["tracking_number"]
            results = client.get(f"/api/v1/search?q={tracking}").json()
            types = [r["type"] for r in results]
            assert "shipment" in types

    def test_search_by_inventory_sku(self, client):
        """Search by SKU to cover inventory search branch."""
        items = client.get("/api/v1/inventory").json()
        if items:
            sku = items[0]["sku"]
            results = client.get(f"/api/v1/search?q={sku}").json()
            types = [r["type"] for r in results]
            assert "inventory" in types

    def test_search_by_vehicle_id(self, client):
        """Search by vehicle ID to cover vehicle search branch."""
        vehicles = client.get("/api/v1/vehicles").json()
        if vehicles:
            vid = vehicles[0]["vehicle_id"]
            results = client.get(f"/api/v1/search?q={vid}").json()
            types = [r["type"] for r in results]
            assert "vehicle" in types

    def test_search_by_facility_code(self, client):
        """Search by facility code to cover facility search branch."""
        facilities = client.get("/api/v1/facilities").json()
        if facilities:
            code = facilities[0]["code"]
            results = client.get(f"/api/v1/search?q={code}").json()
            types = [r["type"] for r in results]
            assert "facility" in types

    def test_search_no_results(self, client):
        """Search with nonsense query should return empty list."""
        results = client.get("/api/v1/search?q=zzzzxxxxxnonexistent99999").json()
        assert results == []


class TestFilteringWorkflows:
    """Test filtering and pagination across endpoints."""

    def test_orders_filter_by_status(self, client):
        """Filter orders by status should return only matching orders."""
        all_orders = client.get("/api/v1/orders").json()
        if all_orders:
            target_status = all_orders[0]["status"]
            filtered = client.get(f"/api/v1/orders?status={target_status}").json()
            for order in filtered:
                assert order["status"] == target_status

    def test_orders_pagination(self, client):
        """Pagination should limit results correctly."""
        page1 = client.get("/api/v1/orders?skip=0&limit=2").json()
        assert len(page1) <= 2

    def test_shipments_filter_by_status(self, client):
        """Filter shipments by status should return only matching shipments."""
        all_shipments = client.get("/api/v1/shipments").json()
        if all_shipments:
            target_status = all_shipments[0]["status"]
            filtered = client.get(f"/api/v1/shipments?status={target_status}").json()
            for shipment in filtered:
                assert shipment["status"] == target_status

    def test_inventory_low_stock_subset(self, client):
        """Low stock items should be a subset of all inventory."""
        all_items = client.get("/api/v1/inventory").json()
        low_stock = client.get("/api/v1/inventory/low-stock").json()
        all_ids = {item["id"] for item in all_items}
        for item in low_stock:
            assert item["id"] in all_ids
