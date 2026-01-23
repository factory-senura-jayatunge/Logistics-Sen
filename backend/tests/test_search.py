def test_search_empty_database(client):
    response = client.get("/api/v1/search/?q=test")
    assert response.status_code == 200
    assert response.json() == []


def test_search_shipment_by_tracking(client, sample_shipment):
    response = client.get(f"/api/v1/search/?q={sample_shipment.tracking_number}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(r["type"] == "shipment" for r in data)


def test_search_order_by_number(client, sample_order):
    response = client.get(f"/api/v1/search/?q={sample_order.order_number}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(r["type"] == "order" for r in data)


def test_search_customer_by_name(client, sample_customer):
    response = client.get(f"/api/v1/search/?q={sample_customer.name}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(r["type"] == "customer" for r in data)


def test_search_inventory_by_sku(client, sample_inventory):
    response = client.get(f"/api/v1/search/?q={sample_inventory.sku}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(r["type"] == "inventory" for r in data)


def test_search_vehicle_by_id(client, sample_vehicle):
    response = client.get(f"/api/v1/search/?q={sample_vehicle.vehicle_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(r["type"] == "vehicle" for r in data)


def test_search_facility_by_code(client, sample_facility):
    response = client.get(f"/api/v1/search/?q={sample_facility.code}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    # Facilities are searched but returned as type "facility"
    shipment_or_facility = [r for r in data if r["type"] in ("shipment", "facility")]
    assert len(shipment_or_facility) >= 1


def test_search_limit(client, test_db, sample_customer):
    from app.models.models import Order

    for i in range(20):
        test_db.add(Order(
            order_number=f"ORD-SEARCH-{i:04d}",
            customer_id=sample_customer.id,
            items_count=1,
            total_value=100,
        ))
    test_db.commit()

    response = client.get("/api/v1/search/?q=ORD-SEARCH&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 5


def test_search_case_insensitive(client, sample_customer):
    response_lower = client.get(f"/api/v1/search/?q={sample_customer.name.lower()}")
    response_upper = client.get(f"/api/v1/search/?q={sample_customer.name.upper()}")
    assert response_lower.status_code == 200
    assert response_upper.status_code == 200
    # Both should find results
    assert len(response_lower.json()) >= 1
    assert len(response_upper.json()) >= 1


def test_search_partial_match(client, sample_shipment):
    # Search for partial tracking number
    partial = sample_shipment.tracking_number[:8]
    response = client.get(f"/api/v1/search/?q={partial}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
