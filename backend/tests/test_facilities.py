def test_get_facilities_empty(client):
    response = client.get("/api/v1/facilities/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_facilities_with_data(client, sample_facility):
    response = client.get("/api/v1/facilities/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["code"] == "WH-TEST"


def test_get_facility_by_id(client, sample_facility):
    response = client.get(f"/api/v1/facilities/{sample_facility.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Warehouse"
    assert "inventory_items" in data
    assert "vehicles" in data


def test_get_facility_with_inventory_and_vehicles(client, sample_inventory, sample_vehicle):
    facility_id = sample_inventory.facility_id
    response = client.get(f"/api/v1/facilities/{facility_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data["inventory_items"]) == 1
    assert len(data["vehicles"]) == 1


def test_get_facility_not_found(client):
    response = client.get("/api/v1/facilities/99999")
    assert response.status_code == 404


def test_create_facility(client):
    facility_data = {
        "code": "WH-NEW-001",
        "name": "New Warehouse",
        "type": "distribution",
        "address": "789 Distribution Ave",
        "city": "Dallas",
        "state": "TX",
        "country": "USA",
        "capacity_percentage": 30,
        "staff_count": 25,
        "status": "operational",
    }
    response = client.post("/api/v1/facilities/", json=facility_data)
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == "WH-NEW-001"
    assert data["city"] == "Dallas"


def test_update_facility(client, sample_facility):
    update_data = {
        "code": "WH-UPDATED",
        "name": "Updated Warehouse",
        "type": "hub",
        "address": "Updated Address",
        "city": "Updated City",
        "state": "UC",
        "country": "USA",
        "capacity_percentage": 80,
        "staff_count": 50,
        "status": "maintenance",
    }
    response = client.put(f"/api/v1/facilities/{sample_facility.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Warehouse"
    assert data["status"] == "maintenance"


def test_delete_facility(client, sample_facility):
    response = client.delete(f"/api/v1/facilities/{sample_facility.id}")
    assert response.status_code == 200

    response = client.get(f"/api/v1/facilities/{sample_facility.id}")
    assert response.status_code == 404
