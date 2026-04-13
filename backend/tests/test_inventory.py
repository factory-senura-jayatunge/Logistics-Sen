def test_get_inventory_empty(client):
    response = client.get("/api/v1/inventory/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_inventory_with_data(client, sample_inventory):
    response = client.get("/api/v1/inventory/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["sku"] == "SKU-TEST-001"


def test_get_inventory_filter_by_facility(client, sample_inventory, sample_facility):
    response = client.get(f"/api/v1/inventory/?facility_id={sample_facility.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    response = client.get("/api/v1/inventory/?facility_id=99999")
    assert response.status_code == 200
    assert response.json() == []


def test_get_inventory_filter_by_category(client, sample_inventory):
    response = client.get("/api/v1/inventory/?category=Electronics")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    response = client.get("/api/v1/inventory/?category=Clothing")
    assert response.status_code == 200
    assert response.json() == []


def test_get_low_stock_items(client, test_db, sample_facility):
    from app.models.models import InventoryItem

    low_stock_item = InventoryItem(
        sku="SKU-LOW-001",
        name="Low Stock Item",
        category="Test",
        facility_id=sample_facility.id,
        quantity=5,
        reorder_point=20,
        status="low_stock",
    )
    test_db.add(low_stock_item)
    test_db.commit()

    response = client.get("/api/v1/inventory/low-stock")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["sku"] == "SKU-LOW-001"


def test_get_inventory_item_by_id(client, sample_inventory):
    response = client.get(f"/api/v1/inventory/{sample_inventory.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Product"
    assert "facility" in data


def test_get_inventory_item_not_found(client):
    response = client.get("/api/v1/inventory/99999")
    assert response.status_code == 404


def test_create_inventory_item(client, sample_facility):
    item_data = {
        "sku": "SKU-NEW-001",
        "name": "New Product",
        "category": "Apparel",
        "facility_id": sample_facility.id,
        "quantity": 50,
        "reorder_point": 10,
        "unit_price": 29.99,
        "status": "in_stock",
    }
    response = client.post("/api/v1/inventory/", json=item_data)
    assert response.status_code == 200
    data = response.json()
    assert data["sku"] == "SKU-NEW-001"
    assert data["quantity"] == 50


def test_update_inventory_item(client, sample_inventory, sample_facility):
    update_data = {
        "sku": "SKU-UPDATED",
        "name": "Updated Product",
        "category": "Updated Category",
        "facility_id": sample_facility.id,
        "quantity": 200,
        "reorder_point": 50,
        "unit_price": 99.99,
        "status": "in_stock",
    }
    response = client.put(f"/api/v1/inventory/{sample_inventory.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Product"
    assert data["quantity"] == 200


def test_update_item_quantity(client, sample_inventory):
    response = client.patch(f"/api/v1/inventory/{sample_inventory.id}/quantity?quantity=5")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "low_stock"

    notification_response = client.get("/api/v1/notifications/?category=inventory&unread_only=true")
    assert notification_response.status_code == 200
    notifications = notification_response.json()
    assert len(notifications) == 1
    assert notifications[0]["reference_id"] == sample_inventory.id
    assert notifications[0]["type"] == "warning"


def test_update_item_quantity_out_of_stock(client, sample_inventory):
    response = client.patch(f"/api/v1/inventory/{sample_inventory.id}/quantity?quantity=0")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "out_of_stock"

    notification_response = client.get("/api/v1/notifications/?category=inventory&unread_only=true")
    assert notification_response.status_code == 200
    notifications = notification_response.json()
    assert len(notifications) == 1
    assert notifications[0]["reference_id"] == sample_inventory.id
    assert notifications[0]["type"] == "error"


def test_update_item_quantity_marks_notification_resolved(client, sample_inventory):
    low_stock_response = client.patch(
        f"/api/v1/inventory/{sample_inventory.id}/quantity?quantity=5"
    )
    assert low_stock_response.status_code == 200

    resolved_response = client.patch(
        f"/api/v1/inventory/{sample_inventory.id}/quantity?quantity=25"
    )
    assert resolved_response.status_code == 200
    assert resolved_response.json()["status"] == "in_stock"

    notification_response = client.get("/api/v1/notifications/?category=inventory&read=false")
    assert notification_response.status_code == 200
    assert notification_response.json() == []


def test_delete_inventory_item(client, sample_inventory):
    response = client.delete(f"/api/v1/inventory/{sample_inventory.id}")
    assert response.status_code == 200

    response = client.get(f"/api/v1/inventory/{sample_inventory.id}")
    assert response.status_code == 404
