def test_get_customers_empty(client):
    response = client.get("/api/v1/customers/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_customers_with_data(client, sample_customer):
    response = client.get("/api/v1/customers/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Company"


def test_get_customer_by_id(client, sample_customer):
    response = client.get(f"/api/v1/customers/{sample_customer.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"


def test_get_customer_not_found(client):
    response = client.get("/api/v1/customers/99999")
    assert response.status_code == 404


def test_create_customer(client):
    customer_data = {
        "name": "New Customer",
        "email": "new@example.com",
        "phone": "555-0200",
        "address": "456 New St",
    }
    response = client.post("/api/v1/customers/", json=customer_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Customer"
    assert data["id"] is not None


def test_update_customer(client, sample_customer):
    update_data = {
        "name": "Updated Company",
        "email": "updated@example.com",
        "phone": "555-0300",
    }
    response = client.put(f"/api/v1/customers/{sample_customer.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Company"


def test_delete_customer(client, sample_customer):
    response = client.delete(f"/api/v1/customers/{sample_customer.id}")
    assert response.status_code == 200

    response = client.get(f"/api/v1/customers/{sample_customer.id}")
    assert response.status_code == 404
