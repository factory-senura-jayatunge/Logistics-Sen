def test_get_dashboard_stats_empty(client):
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_shipments"] == 0
    assert data["total_orders"] == 0
    assert data["total_vehicles"] == 0
    assert data["total_facilities"] == 0


def test_get_dashboard_stats_with_data(client, sample_shipment, sample_order, sample_vehicle, sample_facility):
    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_shipments"] == 1
    assert data["total_orders"] == 1
    assert data["total_vehicles"] == 1
    assert data["total_facilities"] == 1


def test_get_dashboard_stats_counts_by_status(client, test_db, sample_customer, sample_facility):
    from app.models.models import InventoryItem, Order, Shipment, Vehicle

    # Create shipments with different statuses
    test_db.add(Shipment(tracking_number="TRK-1", customer_id=sample_customer.id, origin="A", destination="B", carrier="X", weight_kg=10, status="in_transit"))
    test_db.add(Shipment(tracking_number="TRK-2", customer_id=sample_customer.id, origin="A", destination="B", carrier="X", weight_kg=10, status="delivered"))
    test_db.add(Shipment(tracking_number="TRK-3", customer_id=sample_customer.id, origin="A", destination="B", carrier="X", weight_kg=10, status="delayed"))

    # Create orders with pending status
    test_db.add(Order(order_number="ORD-1", customer_id=sample_customer.id, items_count=1, total_value=100, status="pending"))
    test_db.add(Order(order_number="ORD-2", customer_id=sample_customer.id, items_count=1, total_value=100, status="shipped"))

    # Create vehicles with en_route status
    test_db.add(Vehicle(vehicle_id="VH-1", name="Truck 1", type="truck", driver="D1", current_location="L1", status="en_route"))
    test_db.add(Vehicle(vehicle_id="VH-2", name="Truck 2", type="truck", driver="D2", current_location="L2", status="idle"))

    # Create low stock inventory item
    test_db.add(InventoryItem(sku="SKU-1", name="Item", category="Cat", facility_id=sample_facility.id, quantity=5, status="low_stock"))

    test_db.commit()

    response = client.get("/api/v1/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["shipments_in_transit"] == 1
    assert data["shipments_delivered"] == 1
    assert data["shipments_delayed"] == 1
    assert data["orders_pending"] == 1
    assert data["vehicles_en_route"] == 1
    assert data["low_stock_items"] == 1


def test_get_recent_shipments(client, sample_shipment):
    response = client.get("/api/v1/dashboard/recent-shipments")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["tracking_number"] == "TRK-TEST-0001"


def test_get_recent_shipments_limit(client, test_db, sample_customer):
    from app.models.models import Shipment

    for i in range(10):
        test_db.add(Shipment(
            tracking_number=f"TRK-{i}",
            customer_id=sample_customer.id,
            origin="A",
            destination="B",
            carrier="X",
            weight_kg=10,
        ))
    test_db.commit()

    response = client.get("/api/v1/dashboard/recent-shipments?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3


def test_get_shipment_status_breakdown(client, test_db, sample_customer):
    from app.models.models import Shipment

    test_db.add(Shipment(tracking_number="TRK-1", customer_id=sample_customer.id, origin="A", destination="B", carrier="X", weight_kg=10, status="pending"))
    test_db.add(Shipment(tracking_number="TRK-2", customer_id=sample_customer.id, origin="A", destination="B", carrier="X", weight_kg=10, status="pending"))
    test_db.add(Shipment(tracking_number="TRK-3", customer_id=sample_customer.id, origin="A", destination="B", carrier="X", weight_kg=10, status="delivered"))
    test_db.commit()

    response = client.get("/api/v1/dashboard/shipment-status-breakdown")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    status_map = {item["status"]: item["count"] for item in data}
    assert status_map.get("pending") == 2
    assert status_map.get("delivered") == 1


def test_get_shipment_volume(client, sample_shipment):
    response = client.get("/api/v1/dashboard/shipment-volume")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "date" in data[0]
    assert "count" in data[0]
