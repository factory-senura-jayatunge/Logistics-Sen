"""CRUD tests for all resource route endpoints."""

import uuid

import pytest
from fastapi.testclient import TestClient

from main import app


def _uid():
    return uuid.uuid4().hex[:8]


@pytest.fixture
def client():
    return TestClient(app)


# ---- Helpers ----


def _get_first_customer_id(client):
    customers = client.get("/api/v1/customers").json()
    assert len(customers) > 0
    return customers[0]["id"]


def _get_first_facility_id(client):
    facilities = client.get("/api/v1/facilities").json()
    assert len(facilities) > 0
    return facilities[0]["id"]


# ---- Customers ----


class TestCustomersCRUD:
    def test_create_customer(self, client):
        resp = client.post(
            "/api/v1/customers",
            json={
                "name": "Test Customer",
                "email": f"test-{_uid()}@example.com",
                "phone": "555-0100",
                "address": "123 Test St",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Test Customer"
        assert data["id"] > 0

    def test_get_customer_by_id(self, client):
        cid = _get_first_customer_id(client)
        resp = client.get(f"/api/v1/customers/{cid}")
        assert resp.status_code == 200
        assert resp.json()["id"] == cid

    def test_update_customer(self, client):
        cid = _get_first_customer_id(client)
        resp = client.put(
            f"/api/v1/customers/{cid}",
            json={"name": "Updated Name", "email": "updated@example.com"},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"

    def test_delete_customer(self, client):
        created = client.post(
            "/api/v1/customers", json={"name": "To Delete", "email": f"delete-{_uid()}@example.com"}
        ).json()
        resp = client.delete(f"/api/v1/customers/{created['id']}")
        assert resp.status_code == 200
        assert client.get(f"/api/v1/customers/{created['id']}").status_code == 404

    def test_get_customer_not_found(self, client):
        assert client.get("/api/v1/customers/99999").status_code == 404


# ---- Facilities ----


class TestFacilitiesCRUD:
    def _facility_payload(self, code=None):
        return {
            "code": code or f"TST-{_uid()}",
            "name": "Test Facility",
            "type": "warehouse",
            "address": "456 Test Ave",
            "city": "Testville",
            "state": "TS",
            "country": "USA",
            "capacity_percentage": 50,
            "staff_count": 10,
            "status": "operational",
        }

    def test_create_facility(self, client):
        payload = self._facility_payload()
        resp = client.post("/api/v1/facilities", json=payload)
        assert resp.status_code == 200
        assert resp.json()["code"] == payload["code"]

    def test_get_facility_by_id(self, client):
        fid = _get_first_facility_id(client)
        resp = client.get(f"/api/v1/facilities/{fid}")
        assert resp.status_code == 200
        assert resp.json()["id"] == fid

    def test_update_facility(self, client):
        fid = _get_first_facility_id(client)
        payload = self._facility_payload()
        payload["name"] = "Updated Facility"
        payload["code"] = f"UPD-{_uid()}"
        resp = client.put(f"/api/v1/facilities/{fid}", json=payload)
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Facility"

    def test_delete_facility(self, client):
        created = client.post("/api/v1/facilities", json=self._facility_payload()).json()
        resp = client.delete(f"/api/v1/facilities/{created['id']}")
        assert resp.status_code == 200

    def test_get_facility_not_found(self, client):
        assert client.get("/api/v1/facilities/99999").status_code == 404


# ---- Orders ----


class TestOrdersCRUD:
    def test_create_order(self, client):
        cid = _get_first_customer_id(client)
        resp = client.post(
            "/api/v1/orders",
            json={
                "customer_id": cid,
                "items_count": 5,
                "total_value": 250.0,
                "priority": "high",
                "status": "pending",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["order_number"].startswith("ORD-")

    def test_get_order_by_id(self, client):
        orders = client.get("/api/v1/orders").json()
        if orders:
            oid = orders[0]["id"]
            resp = client.get(f"/api/v1/orders/{oid}")
            assert resp.status_code == 200
            assert resp.json()["id"] == oid

    def test_update_order(self, client):
        cid = _get_first_customer_id(client)
        order = client.post(
            "/api/v1/orders", json={"customer_id": cid, "items_count": 1, "total_value": 10.0}
        ).json()
        resp = client.put(
            f"/api/v1/orders/{order['id']}",
            json={
                "customer_id": cid,
                "items_count": 2,
                "total_value": 20.0,
                "priority": "low",
                "status": "confirmed",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["items_count"] == 2

    def test_update_order_status(self, client):
        cid = _get_first_customer_id(client)
        order = client.post(
            "/api/v1/orders", json={"customer_id": cid, "items_count": 1, "total_value": 10.0}
        ).json()
        resp = client.patch(f"/api/v1/orders/{order['id']}/status?status=confirmed")
        assert resp.status_code == 200

    def test_delete_order(self, client):
        cid = _get_first_customer_id(client)
        order = client.post(
            "/api/v1/orders", json={"customer_id": cid, "items_count": 1, "total_value": 10.0}
        ).json()
        resp = client.delete(f"/api/v1/orders/{order['id']}")
        assert resp.status_code == 200

    def test_get_order_not_found(self, client):
        assert client.get("/api/v1/orders/99999").status_code == 404

    def test_list_orders_with_filters(self, client):
        resp = client.get("/api/v1/orders?status=pending&priority=medium")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ---- Shipments ----


class TestShipmentsCRUD:
    def test_create_shipment(self, client):
        cid = _get_first_customer_id(client)
        resp = client.post(
            "/api/v1/shipments",
            json={
                "customer_id": cid,
                "origin": "A",
                "destination": "B",
                "carrier": "FedEx",
                "weight_kg": 10.0,
            },
        )
        assert resp.status_code == 200
        assert resp.json()["tracking_number"].startswith("SHP-")

    def test_get_shipment_by_id(self, client):
        shipments = client.get("/api/v1/shipments").json()
        if shipments:
            sid = shipments[0]["id"]
            resp = client.get(f"/api/v1/shipments/{sid}")
            assert resp.status_code == 200

    def test_get_shipment_by_tracking(self, client):
        cid = _get_first_customer_id(client)
        shipment = client.post(
            "/api/v1/shipments",
            json={
                "customer_id": cid,
                "origin": "X",
                "destination": "Y",
                "carrier": "UPS",
                "weight_kg": 5.0,
            },
        ).json()
        resp = client.get(f"/api/v1/shipments/tracking/{shipment['tracking_number']}")
        assert resp.status_code == 200

    def test_update_shipment(self, client):
        cid = _get_first_customer_id(client)
        shipment = client.post(
            "/api/v1/shipments",
            json={
                "customer_id": cid,
                "origin": "A",
                "destination": "B",
                "carrier": "FedEx",
                "weight_kg": 10.0,
            },
        ).json()
        resp = client.put(
            f"/api/v1/shipments/{shipment['id']}",
            json={
                "customer_id": cid,
                "origin": "A",
                "destination": "C",
                "carrier": "UPS",
                "weight_kg": 12.0,
            },
        )
        assert resp.status_code == 200
        assert resp.json()["destination"] == "C"

    def test_update_shipment_status(self, client):
        cid = _get_first_customer_id(client)
        shipment = client.post(
            "/api/v1/shipments",
            json={
                "customer_id": cid,
                "origin": "A",
                "destination": "B",
                "carrier": "FedEx",
                "weight_kg": 10.0,
            },
        ).json()
        resp = client.patch(f"/api/v1/shipments/{shipment['id']}/status?status=in_transit")
        assert resp.status_code == 200

    def test_delete_shipment(self, client):
        cid = _get_first_customer_id(client)
        shipment = client.post(
            "/api/v1/shipments",
            json={
                "customer_id": cid,
                "origin": "A",
                "destination": "B",
                "carrier": "FedEx",
                "weight_kg": 10.0,
            },
        ).json()
        resp = client.delete(f"/api/v1/shipments/{shipment['id']}")
        assert resp.status_code == 200

    def test_get_shipment_not_found(self, client):
        assert client.get("/api/v1/shipments/99999").status_code == 404

    def test_get_shipment_by_tracking_not_found(self, client):
        assert client.get("/api/v1/shipments/tracking/NONEXISTENT").status_code == 404


# ---- Inventory ----


class TestInventoryCRUD:
    def test_create_inventory_item(self, client):
        fid = _get_first_facility_id(client)
        resp = client.post(
            "/api/v1/inventory",
            json={
                "sku": "TST-SKU-001",
                "name": "Test Item",
                "category": "electronics",
                "facility_id": fid,
                "quantity": 100,
                "reorder_point": 10,
                "unit_price": 29.99,
                "status": "in_stock",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["sku"] == "TST-SKU-001"

    def test_get_inventory_item_by_id(self, client):
        items = client.get("/api/v1/inventory").json()
        if items:
            iid = items[0]["id"]
            resp = client.get(f"/api/v1/inventory/{iid}")
            assert resp.status_code == 200

    def test_update_inventory_item(self, client):
        fid = _get_first_facility_id(client)
        item = client.post(
            "/api/v1/inventory",
            json={
                "sku": "UPD-SKU-001",
                "name": "Update Me",
                "category": "electronics",
                "facility_id": fid,
                "quantity": 50,
                "reorder_point": 5,
                "unit_price": 19.99,
                "status": "in_stock",
            },
        ).json()
        resp = client.put(
            f"/api/v1/inventory/{item['id']}",
            json={
                "sku": "UPD-SKU-001",
                "name": "Updated Item",
                "category": "electronics",
                "facility_id": fid,
                "quantity": 75,
                "reorder_point": 5,
                "unit_price": 24.99,
                "status": "in_stock",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Item"

    def test_update_item_quantity(self, client):
        fid = _get_first_facility_id(client)
        item = client.post(
            "/api/v1/inventory",
            json={
                "sku": "QTY-SKU-001",
                "name": "Qty Test",
                "category": "electronics",
                "facility_id": fid,
                "quantity": 100,
                "reorder_point": 20,
                "unit_price": 10.0,
                "status": "in_stock",
            },
        ).json()
        resp = client.patch(f"/api/v1/inventory/{item['id']}/quantity?quantity=5")
        assert resp.status_code == 200
        assert resp.json()["status"] == "low_stock"

    def test_update_item_quantity_to_zero(self, client):
        fid = _get_first_facility_id(client)
        item = client.post(
            "/api/v1/inventory",
            json={
                "sku": "QTY-SKU-002",
                "name": "Qty Zero",
                "category": "electronics",
                "facility_id": fid,
                "quantity": 10,
                "reorder_point": 5,
                "unit_price": 10.0,
                "status": "in_stock",
            },
        ).json()
        resp = client.patch(f"/api/v1/inventory/{item['id']}/quantity?quantity=0")
        assert resp.status_code == 200
        assert resp.json()["status"] == "out_of_stock"

    def test_update_item_quantity_above_reorder(self, client):
        fid = _get_first_facility_id(client)
        item = client.post(
            "/api/v1/inventory",
            json={
                "sku": "QTY-SKU-003",
                "name": "Qty High",
                "category": "electronics",
                "facility_id": fid,
                "quantity": 10,
                "reorder_point": 5,
                "unit_price": 10.0,
                "status": "low_stock",
            },
        ).json()
        resp = client.patch(f"/api/v1/inventory/{item['id']}/quantity?quantity=100")
        assert resp.status_code == 200
        assert resp.json()["status"] == "in_stock"

    def test_delete_inventory_item(self, client):
        fid = _get_first_facility_id(client)
        item = client.post(
            "/api/v1/inventory",
            json={
                "sku": "DEL-SKU-001",
                "name": "Delete Me",
                "category": "electronics",
                "facility_id": fid,
                "quantity": 1,
                "reorder_point": 0,
                "unit_price": 1.0,
                "status": "in_stock",
            },
        ).json()
        resp = client.delete(f"/api/v1/inventory/{item['id']}")
        assert resp.status_code == 200

    def test_get_inventory_item_not_found(self, client):
        assert client.get("/api/v1/inventory/99999").status_code == 404

    def test_list_inventory_with_filters(self, client):
        fid = _get_first_facility_id(client)
        resp = client.get(
            f"/api/v1/inventory?facility_id={fid}&status=in_stock&category=electronics"
        )
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ---- Vehicles ----


class TestVehiclesCRUD:
    def _vehicle_payload(self, vid=None):
        return {
            "vehicle_id": vid or f"VH-{_uid()}",
            "name": "Test Truck",
            "type": "truck",
            "driver": "John Doe",
            "facility_id": None,
            "current_location": "Chicago, IL",
            "destination": "NYC",
            "status": "idle",
            "fuel_level": 80,
        }

    def test_create_vehicle(self, client):
        payload = self._vehicle_payload()
        resp = client.post("/api/v1/vehicles", json=payload)
        assert resp.status_code == 200
        assert resp.json()["vehicle_id"] == payload["vehicle_id"]

    def test_get_vehicle_by_id(self, client):
        vehicles = client.get("/api/v1/vehicles").json()
        if vehicles:
            vid = vehicles[0]["id"]
            resp = client.get(f"/api/v1/vehicles/{vid}")
            assert resp.status_code == 200

    def test_update_vehicle(self, client):
        vid = f"VH-{_uid()}"
        vehicle = client.post("/api/v1/vehicles", json=self._vehicle_payload(vid)).json()
        payload = self._vehicle_payload(vid)
        payload["name"] = "Updated Truck"
        resp = client.put(f"/api/v1/vehicles/{vehicle['id']}", json=payload)
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Truck"

    def test_update_vehicle_status(self, client):
        vehicle = client.post("/api/v1/vehicles", json=self._vehicle_payload()).json()
        resp = client.patch(f"/api/v1/vehicles/{vehicle['id']}/status?status=en_route")
        assert resp.status_code == 200

    def test_update_vehicle_location(self, client):
        vehicle = client.post("/api/v1/vehicles", json=self._vehicle_payload()).json()
        resp = client.patch(
            f"/api/v1/vehicles/{vehicle['id']}/location?location=Denver%2C+CO&destination=LA&eta=2h"
        )
        assert resp.status_code == 200

    def test_delete_vehicle(self, client):
        vehicle = client.post("/api/v1/vehicles", json=self._vehicle_payload()).json()
        resp = client.delete(f"/api/v1/vehicles/{vehicle['id']}")
        assert resp.status_code == 200

    def test_get_vehicle_not_found(self, client):
        assert client.get("/api/v1/vehicles/99999").status_code == 404

    def test_list_vehicles_with_filters(self, client):
        resp = client.get("/api/v1/vehicles?type=truck&status=idle")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ---- Users ----


class TestUsersCRUD:
    def test_create_user(self, client):
        email = f"newuser-{_uid()}@example.com"
        resp = client.post(
            "/api/v1/users",
            json={"email": email, "name": "New User", "role": "dispatcher", "status": "active"},
        )
        assert resp.status_code == 200
        assert resp.json()["email"] == email

    def test_get_user_by_id(self, client):
        users = client.get("/api/v1/users").json()
        if users:
            uid = users[0]["id"]
            resp = client.get(f"/api/v1/users/{uid}")
            assert resp.status_code == 200
            assert resp.json()["id"] == uid

    def test_update_user(self, client):
        user = client.post(
            "/api/v1/users",
            json={
                "email": f"update-{_uid()}@example.com",
                "name": "Update Me",
                "role": "dispatcher",
                "status": "active",
            },
        ).json()
        resp = client.put(
            f"/api/v1/users/{user['id']}",
            json={
                "email": f"updated-{_uid()}@example.com",
                "name": "Updated User",
                "role": "admin",
                "status": "active",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated User"

    def test_delete_user(self, client):
        user = client.post(
            "/api/v1/users",
            json={
                "email": f"todelete-{_uid()}@example.com",
                "name": "Delete Me",
                "role": "dispatcher",
                "status": "active",
            },
        ).json()
        resp = client.delete(f"/api/v1/users/{user['id']}")
        assert resp.status_code == 200

    def test_get_user_not_found(self, client):
        assert client.get("/api/v1/users/99999").status_code == 404
