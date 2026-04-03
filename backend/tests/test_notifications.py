"""Tests for notification endpoints."""

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestNotifications:
    def _create_notification(self, client):
        return client.post("/api/v1/notifications", json={
            "title": "Test Alert",
            "message": "Something happened",
            "type": "info",
            "category": "system",
        }).json()

    def test_list_notifications(self, client):
        resp = client.get("/api/v1/notifications")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_notifications_unread_only(self, client):
        resp = client.get("/api/v1/notifications?unread_only=true")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_unread_count(self, client):
        resp = client.get("/api/v1/notifications/unread-count")
        assert resp.status_code == 200
        assert "count" in resp.json()

    def test_create_notification(self, client):
        data = self._create_notification(client)
        assert data["title"] == "Test Alert"
        assert data["id"] > 0

    def test_get_notification_by_id(self, client):
        created = self._create_notification(client)
        resp = client.get(f"/api/v1/notifications/{created['id']}")
        assert resp.status_code == 200
        assert resp.json()["id"] == created["id"]

    def test_mark_as_read(self, client):
        created = self._create_notification(client)
        resp = client.patch(f"/api/v1/notifications/{created['id']}/read")
        assert resp.status_code == 200

    def test_mark_all_as_read(self, client):
        resp = client.patch("/api/v1/notifications/read-all")
        assert resp.status_code == 200

    def test_delete_notification(self, client):
        created = self._create_notification(client)
        resp = client.delete(f"/api/v1/notifications/{created['id']}")
        assert resp.status_code == 200

    def test_get_notification_not_found(self, client):
        assert client.get("/api/v1/notifications/99999").status_code == 404

    def test_mark_as_read_not_found(self, client):
        assert client.patch("/api/v1/notifications/99999/read").status_code == 404

    def test_delete_notification_not_found(self, client):
        assert client.delete("/api/v1/notifications/99999").status_code == 404
