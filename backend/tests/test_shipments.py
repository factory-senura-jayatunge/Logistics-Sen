def test_get_shipments_empty(client):
    response = client.get("/api/v1/shipments/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_shipments_with_data(client, sample_shipment):
    response = client.get("/api/v1/shipments/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["tracking_number"] == "TRK-TEST-0001"


def test_get_shipments_filter_by_status(client, sample_shipment):
    response = client.get("/api/v1/shipments/?status=pending")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    response = client.get("/api/v1/shipments/?status=delivered")
    assert response.status_code == 200
    assert response.json() == []


def test_get_shipment_by_id(client, sample_shipment):
    response = client.get(f"/api/v1/shipments/{sample_shipment.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["tracking_number"] == "TRK-TEST-0001"
    assert "customer" in data


def test_get_shipment_not_found(client):
    response = client.get("/api/v1/shipments/99999")
    assert response.status_code == 404


def test_get_shipment_by_tracking(client, sample_shipment):
    response = client.get(f"/api/v1/shipments/tracking/{sample_shipment.tracking_number}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_shipment.id


def test_get_shipment_by_tracking_not_found(client):
    response = client.get("/api/v1/shipments/tracking/INVALID-TRACKING")
    assert response.status_code == 404


def test_create_shipment(client, sample_customer):
    shipment_data = {
        "customer_id": sample_customer.id,
        "origin": "Chicago, IL",
        "destination": "Miami, FL",
        "carrier": "UPS",
        "weight_kg": 15.0,
        "status": "pending",
    }
    response = client.post("/api/v1/shipments/", json=shipment_data)
    assert response.status_code == 200
    data = response.json()
    assert data["tracking_number"].startswith("SHP-2024-")
    assert data["carrier"] == "UPS"


def test_update_shipment(client, sample_shipment):
    update_data = {
        "customer_id": sample_shipment.customer_id,
        "origin": "Seattle, WA",
        "destination": "Boston, MA",
        "carrier": "DHL",
        "weight_kg": 30.0,
        "status": "in_transit",
    }
    response = client.put(f"/api/v1/shipments/{sample_shipment.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["carrier"] == "DHL"
    assert data["status"] == "in_transit"


def test_update_shipment_status(client, sample_shipment):
    response = client.patch(f"/api/v1/shipments/{sample_shipment.id}/status?status=delivered")
    assert response.status_code == 200
    assert "delivered" in response.json()["message"]


def test_delete_shipment(client, sample_shipment):
    response = client.delete(f"/api/v1/shipments/{sample_shipment.id}")
    assert response.status_code == 200

    response = client.get(f"/api/v1/shipments/{sample_shipment.id}")
    assert response.status_code == 404
