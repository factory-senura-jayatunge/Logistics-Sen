"""Tests for bulk operation endpoints."""

import io
import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    return TestClient(app)


def _get_first_customer_id(client):
    return client.get("/api/v1/customers").json()[0]["id"]


def _get_first_facility_id(client):
    return client.get("/api/v1/facilities").json()[0]["id"]


class TestBulkOrders:
    def test_bulk_delete_orders(self, client):
        cid = _get_first_customer_id(client)
        ids = []
        for _ in range(2):
            o = client.post("/api/v1/orders", json={
                "customer_id": cid, "items_count": 1, "total_value": 10.0
            }).json()
            ids.append(o["id"])
        resp = client.post("/api/v1/bulk/orders/delete", json={"ids": ids})
        assert resp.status_code == 200
        assert resp.json()["success_count"] == 2

    def test_bulk_delete_orders_with_missing(self, client):
        resp = client.post("/api/v1/bulk/orders/delete", json={"ids": [999998, 999999]})
        assert resp.status_code == 200
        assert resp.json()["failed_count"] == 2

    def test_bulk_update_order_status(self, client):
        cid = _get_first_customer_id(client)
        ids = []
        for _ in range(2):
            o = client.post("/api/v1/orders", json={
                "customer_id": cid, "items_count": 1, "total_value": 10.0
            }).json()
            ids.append(o["id"])
        resp = client.patch("/api/v1/bulk/orders/status", json={
            "ids": ids, "status": "confirmed"
        })
        assert resp.status_code == 200
        assert resp.json()["success_count"] == 2

    def test_export_orders(self, client):
        resp = client.get("/api/v1/bulk/orders/export")
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        assert "order_number" in resp.text

    def test_import_orders(self, client):
        cid = _get_first_customer_id(client)
        csv_content = f"customer_id,items_count,total_value,priority,status\n{cid},3,100.0,high,pending\n{cid},1,50.0,low,pending\n"
        resp = client.post(
            "/api/v1/bulk/orders/import",
            files={"file": ("orders.csv", io.BytesIO(csv_content.encode()), "text/csv")}
        )
        assert resp.status_code == 200
        assert resp.json()["imported"] == 2

    def test_import_orders_invalid_file(self, client):
        resp = client.post(
            "/api/v1/bulk/orders/import",
            files={"file": ("orders.txt", io.BytesIO(b"bad"), "text/plain")}
        )
        assert resp.status_code == 400


class TestBulkShipments:
    def test_bulk_delete_shipments(self, client):
        cid = _get_first_customer_id(client)
        ids = []
        for _ in range(2):
            s = client.post("/api/v1/shipments", json={
                "customer_id": cid, "origin": "A", "destination": "B",
                "carrier": "FedEx", "weight_kg": 5.0
            }).json()
            ids.append(s["id"])
        resp = client.post("/api/v1/bulk/shipments/delete", json={"ids": ids})
        assert resp.status_code == 200
        assert resp.json()["success_count"] == 2

    def test_bulk_update_shipment_status(self, client):
        cid = _get_first_customer_id(client)
        ids = []
        for _ in range(2):
            s = client.post("/api/v1/shipments", json={
                "customer_id": cid, "origin": "A", "destination": "B",
                "carrier": "FedEx", "weight_kg": 5.0
            }).json()
            ids.append(s["id"])
        resp = client.patch("/api/v1/bulk/shipments/status", json={
            "ids": ids, "status": "in_transit"
        })
        assert resp.status_code == 200
        assert resp.json()["success_count"] == 2

    def test_export_shipments(self, client):
        resp = client.get("/api/v1/bulk/shipments/export")
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        assert "tracking_number" in resp.text

    def test_import_shipments(self, client):
        cid = _get_first_customer_id(client)
        csv_content = f"customer_id,order_id,origin,destination,carrier,weight_kg,status\n{cid},,Chicago,NYC,UPS,10.0,pending\n"
        resp = client.post(
            "/api/v1/bulk/shipments/import",
            files={"file": ("shipments.csv", io.BytesIO(csv_content.encode()), "text/csv")}
        )
        assert resp.status_code == 200
        assert resp.json()["imported"] == 1

    def test_import_shipments_invalid_file(self, client):
        resp = client.post(
            "/api/v1/bulk/shipments/import",
            files={"file": ("shipments.txt", io.BytesIO(b"bad"), "text/plain")}
        )
        assert resp.status_code == 400


class TestBulkInventory:
    def test_bulk_delete_inventory(self, client):
        fid = _get_first_facility_id(client)
        ids = []
        for i in range(2):
            item = client.post("/api/v1/inventory", json={
                "sku": f"BULK-DEL-{i}", "name": f"Bulk Del {i}",
                "category": "test", "facility_id": fid, "quantity": 10,
                "reorder_point": 5, "unit_price": 1.0, "status": "in_stock"
            }).json()
            ids.append(item["id"])
        resp = client.post("/api/v1/bulk/inventory/delete", json={"ids": ids})
        assert resp.status_code == 200
        assert resp.json()["success_count"] == 2

    def test_export_inventory(self, client):
        resp = client.get("/api/v1/bulk/inventory/export")
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        assert "sku" in resp.text

    def test_import_inventory(self, client):
        fid = _get_first_facility_id(client)
        csv_content = f"sku,name,category,facility_id,quantity,reorder_point,unit_price,status\nIMPORT-001,Imported Item,electronics,{fid},50,10,19.99,in_stock\n"
        resp = client.post(
            "/api/v1/bulk/inventory/import",
            files={"file": ("inventory.csv", io.BytesIO(csv_content.encode()), "text/csv")}
        )
        assert resp.status_code == 200
        assert resp.json()["imported"] == 1

    def test_import_inventory_invalid_file(self, client):
        resp = client.post(
            "/api/v1/bulk/inventory/import",
            files={"file": ("inventory.txt", io.BytesIO(b"bad"), "text/plain")}
        )
        assert resp.status_code == 400
