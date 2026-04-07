def test_get_orders_empty(client):
    response = client.get("/api/v1/orders/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_orders_with_data(client, sample_order):
    response = client.get("/api/v1/orders/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["order_number"] == "ORD-TEST-0001"


def test_get_orders_filter_by_status(client, sample_order):
    response = client.get("/api/v1/orders/?status=pending")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    response = client.get("/api/v1/orders/?status=shipped")
    assert response.status_code == 200
    assert response.json() == []


def test_get_orders_filter_by_priority(client, sample_order):
    response = client.get("/api/v1/orders/?priority=medium")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    response = client.get("/api/v1/orders/?priority=high")
    assert response.status_code == 200
    assert response.json() == []


def test_get_order_by_id(client, sample_order):
    response = client.get(f"/api/v1/orders/{sample_order.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["order_number"] == "ORD-TEST-0001"
    assert "customer" in data


def test_get_order_not_found(client):
    response = client.get("/api/v1/orders/99999")
    assert response.status_code == 404


def test_create_order(client, sample_customer):
    order_data = {
        "customer_id": sample_customer.id,
        "items_count": 10,
        "total_value": 250.00,
        "priority": "high",
        "status": "pending",
    }
    response = client.post("/api/v1/orders/", json=order_data)
    assert response.status_code == 200
    data = response.json()
    assert data["order_number"].startswith("ORD-2024-")
    assert data["items_count"] == 10


def test_update_order(client, sample_order):
    update_data = {
        "customer_id": sample_order.customer_id,
        "items_count": 20,
        "total_value": 500.00,
        "priority": "critical",
        "status": "processing",
    }
    response = client.put(f"/api/v1/orders/{sample_order.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["items_count"] == 20
    assert data["priority"] == "critical"


def test_update_order_status(client, sample_order):
    response = client.patch(f"/api/v1/orders/{sample_order.id}/status?status=shipped")
    assert response.status_code == 200
    assert "shipped" in response.json()["message"]


def test_delete_order(client, sample_order):
    response = client.delete(f"/api/v1/orders/{sample_order.id}")
    assert response.status_code == 200

    response = client.get(f"/api/v1/orders/{sample_order.id}")
    assert response.status_code == 404
