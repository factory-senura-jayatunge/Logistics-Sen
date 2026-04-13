def test_get_notifications_empty(client):
    response = client.get("/api/v1/notifications/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_notifications_with_data(client, sample_notification):
    response = client.get("/api/v1/notifications/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Notification"


def test_get_notifications_unread_only(client, test_db, sample_user):
    from app.models.models import Notification

    unread = Notification(user_id=sample_user.id, title="Unread", type="info", read=False)
    read = Notification(user_id=sample_user.id, title="Read", type="info", read=True)
    test_db.add_all([unread, read])
    test_db.commit()

    response = client.get("/api/v1/notifications/?unread_only=true")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Unread"


def test_get_notifications_with_filters(client, test_db, sample_user):
    from app.models.models import Notification

    inventory_warning = Notification(
        user_id=sample_user.id,
        title="Low Stock",
        type="warning",
        category="inventory",
        read=False,
    )
    shipment_info = Notification(
        user_id=sample_user.id,
        title="Shipment Update",
        type="info",
        category="shipment",
        read=True,
    )
    test_db.add_all([inventory_warning, shipment_info])
    test_db.commit()

    response = client.get("/api/v1/notifications/?category=inventory&type=warning&read=false")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Low Stock"


def test_get_notification_count_by_category(client, test_db, sample_user):
    from app.models.models import Notification

    test_db.add_all(
        [
            Notification(
                user_id=sample_user.id,
                title="Inventory 1",
                type="warning",
                category="inventory",
                read=False,
            ),
            Notification(
                user_id=sample_user.id,
                title="Inventory 2",
                type="error",
                category="inventory",
                read=False,
            ),
            Notification(
                user_id=sample_user.id,
                title="Shipment 1",
                type="info",
                category="shipment",
                read=False,
            ),
            Notification(
                user_id=sample_user.id,
                title="Read Inventory",
                type="warning",
                category="inventory",
                read=True,
            ),
        ]
    )
    test_db.commit()

    response = client.get("/api/v1/notifications/count-by-category")
    assert response.status_code == 200
    assert response.json() == {"inventory": 2, "shipment": 1}


def test_get_unread_count(client, sample_notification):
    response = client.get("/api/v1/notifications/unread-count")
    assert response.status_code == 200
    assert response.json()["count"] == 1


def test_get_notification_by_id(client, sample_notification):
    response = client.get(f"/api/v1/notifications/{sample_notification.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "This is a test notification"


def test_get_notification_not_found(client):
    response = client.get("/api/v1/notifications/99999")
    assert response.status_code == 404


def test_create_notification(client, sample_user):
    notification_data = {
        "user_id": sample_user.id,
        "title": "New Alert",
        "message": "Something happened",
        "type": "warning",
        "category": "shipment",
    }
    response = client.post("/api/v1/notifications/", json=notification_data)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Alert"
    assert data["type"] == "warning"


def test_mark_as_read(client, sample_notification):
    response = client.patch(f"/api/v1/notifications/{sample_notification.id}/read")
    assert response.status_code == 200

    response = client.get(f"/api/v1/notifications/{sample_notification.id}")
    assert response.json()["read"] is True


def test_mark_all_as_read(client, test_db, sample_user):
    from app.models.models import Notification

    n1 = Notification(user_id=sample_user.id, title="N1", type="info", read=False)
    n2 = Notification(user_id=sample_user.id, title="N2", type="info", read=False)
    test_db.add_all([n1, n2])
    test_db.commit()

    response = client.patch("/api/v1/notifications/read-all")
    assert response.status_code == 200

    response = client.get("/api/v1/notifications/unread-count")
    assert response.json()["count"] == 0


def test_delete_notification(client, sample_notification):
    response = client.delete(f"/api/v1/notifications/{sample_notification.id}")
    assert response.status_code == 200

    response = client.get(f"/api/v1/notifications/{sample_notification.id}")
    assert response.status_code == 404
