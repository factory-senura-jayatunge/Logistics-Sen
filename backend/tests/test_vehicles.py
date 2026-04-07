def test_get_vehicles_empty(client):
    response = client.get("/api/v1/vehicles/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_vehicles_with_data(client, sample_vehicle):
    response = client.get("/api/v1/vehicles/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["vehicle_id"] == "VH-TEST-001"


def test_get_vehicles_filter_by_type(client, sample_vehicle):
    response = client.get("/api/v1/vehicles/?type=truck")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    response = client.get("/api/v1/vehicles/?type=plane")
    assert response.status_code == 200
    assert response.json() == []


def test_get_vehicles_filter_by_status(client, sample_vehicle):
    response = client.get("/api/v1/vehicles/?status=idle")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    response = client.get("/api/v1/vehicles/?status=en_route")
    assert response.status_code == 200
    assert response.json() == []


def test_get_vehicle_by_id(client, sample_vehicle):
    response = client.get(f"/api/v1/vehicles/{sample_vehicle.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Truck"
    assert "facility" in data


def test_get_vehicle_not_found(client):
    response = client.get("/api/v1/vehicles/99999")
    assert response.status_code == 404


def test_create_vehicle(client, sample_facility):
    vehicle_data = {
        "vehicle_id": "VH-NEW-001",
        "name": "New Truck",
        "type": "truck",
        "driver": "Jane Driver",
        "facility_id": sample_facility.id,
        "current_location": "Denver, CO",
        "status": "idle",
        "fuel_level": 100,
    }
    response = client.post("/api/v1/vehicles/", json=vehicle_data)
    assert response.status_code == 200
    data = response.json()
    assert data["vehicle_id"] == "VH-NEW-001"
    assert data["driver"] == "Jane Driver"


def test_update_vehicle(client, sample_vehicle, sample_facility):
    update_data = {
        "vehicle_id": "VH-UPDATED",
        "name": "Updated Truck",
        "type": "ship",
        "driver": "Bob Captain",
        "facility_id": sample_facility.id,
        "current_location": "Port of LA",
        "status": "loading",
        "fuel_level": 75,
    }
    response = client.put(f"/api/v1/vehicles/{sample_vehicle.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Truck"
    assert data["type"] == "ship"


def test_update_vehicle_status(client, sample_vehicle):
    response = client.patch(f"/api/v1/vehicles/{sample_vehicle.id}/status?status=en_route")
    assert response.status_code == 200
    assert "en_route" in response.json()["message"]


def test_update_vehicle_location(client, sample_vehicle):
    response = client.patch(
        f"/api/v1/vehicles/{sample_vehicle.id}/location?location=Phoenix, AZ&destination=Las Vegas, NV&eta=2h 30m"
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Vehicle location updated"


def test_delete_vehicle(client, sample_vehicle):
    response = client.delete(f"/api/v1/vehicles/{sample_vehicle.id}")
    assert response.status_code == 200

    response = client.get(f"/api/v1/vehicles/{sample_vehicle.id}")
    assert response.status_code == 404
