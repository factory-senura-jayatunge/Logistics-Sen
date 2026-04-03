"""Tests for dashboard endpoints including shipment volume."""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestDashboardVolume:
    def test_shipment_volume_default(self, client):
        resp = client.get("/api/v1/dashboard/shipment-volume")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        if data:
            assert "date" in data[0]
            assert "count" in data[0]

    def test_shipment_volume_custom_days(self, client):
        resp = client.get("/api/v1/dashboard/shipment-volume?days=7")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
