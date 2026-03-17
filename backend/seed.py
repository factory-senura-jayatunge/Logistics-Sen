"""Seed the database with mock data for demo purposes."""
import random
from datetime import datetime, timedelta

from app.db.database import Base, SessionLocal, engine
from app.models.models import (
    Customer,
    Facility,
    InventoryItem,
    Notification,
    Order,
    Shipment,
    User,
    Vehicle,
)

Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()

    if db.query(Customer).count() > 0:
        print("Database already seeded. Skipping...")
        db.close()
        return

    print("Seeding database with mock data...")

    users = [
        User(email="john.doe@acmelogistics.com", name="John Doe", role="admin", status="active"),
        User(email="sarah.williams@acmelogistics.com", name="Sarah Williams", role="operations_manager", status="active"),
        User(email="mike.johnson@acmelogistics.com", name="Mike Johnson", role="dispatcher", status="active"),
        User(email="emily.chen@acmelogistics.com", name="Emily Chen", role="warehouse_staff", status="active"),
        User(email="robert.brown@acmelogistics.com", name="Robert Brown", role="driver", status="inactive"),
        User(email="lisa.garcia@acmelogistics.com", name="Lisa Garcia", role="dispatcher", status="active"),
        User(email="david.kim@acmelogistics.com", name="David Kim", role="warehouse_staff", status="active"),
    ]
    db.add_all(users)

    customers = [
        Customer(name="TechCorp Inc.", email="orders@techcorp.com", phone="+1-555-0101", address="123 Tech Blvd, San Jose, CA 95110"),
        Customer(name="Global Retail", email="supply@globalretail.com", phone="+1-555-0102", address="456 Commerce St, Dallas, TX 75201"),
        Customer(name="Acme Foods", email="logistics@acmefoods.com", phone="+1-555-0103", address="789 Food Way, Chicago, IL 60601"),
        Customer(name="MediSupply Co.", email="orders@medisupply.com", phone="+1-555-0104", address="321 Health Ave, Boston, MA 02101"),
        Customer(name="AutoParts Ltd.", email="procurement@autoparts.com", phone="+1-555-0105", address="654 Motor Lane, Detroit, MI 48201"),
        Customer(name="ElectroGoods", email="supply@electrogoods.com", phone="+1-555-0106", address="987 Circuit Dr, Austin, TX 78701"),
        Customer(name="FoodCo International", email="orders@foodco.com", phone="+1-555-0107", address="147 Harvest Rd, Sacramento, CA 95814"),
        Customer(name="BuildMaterials Inc.", email="logistics@buildmat.com", phone="+1-555-0108", address="258 Construction Blvd, Phoenix, AZ 85001"),
        Customer(name="PharmaCare Corp.", email="supply@pharmacare.com", phone="+1-555-0109", address="369 Wellness Way, Miami, FL 33101"),
        Customer(name="SportEquip Pro", email="orders@sportequip.com", phone="+1-555-0110", address="741 Athletic Ave, Denver, CO 80201"),
    ]
    db.add_all(customers)
    db.flush()

    facilities = [
        Facility(code="WH-NYC", name="New York Distribution Center", type="distribution", address="123 Logistics Blvd", city="Brooklyn", state="NY", latitude=40.6782, longitude=-73.9442, capacity_percentage=85, staff_count=156, status="operational"),
        Facility(code="WH-LAX", name="Los Angeles Hub", type="hub", address="456 Freight Ave", city="Los Angeles", state="CA", latitude=33.9425, longitude=-118.4081, capacity_percentage=72, staff_count=124, status="operational"),
        Facility(code="WH-CHI", name="Chicago Fulfillment Center", type="fulfillment", address="789 Supply Chain Dr", city="Chicago", state="IL", latitude=41.8781, longitude=-87.6298, capacity_percentage=91, staff_count=203, status="operational"),
        Facility(code="WH-HOU", name="Houston Logistics Center", type="warehouse", address="321 Industrial Pkwy", city="Houston", state="TX", latitude=29.7604, longitude=-95.3698, capacity_percentage=45, staff_count=78, status="maintenance"),
        Facility(code="WH-SEA", name="Seattle Port Facility", type="port", address="555 Harbor Way", city="Seattle", state="WA", latitude=47.6062, longitude=-122.3321, capacity_percentage=68, staff_count=92, status="operational"),
        Facility(code="WH-MIA", name="Miami International Hub", type="hub", address="777 Export Blvd", city="Miami", state="FL", latitude=25.7617, longitude=-80.1918, capacity_percentage=78, staff_count=134, status="operational"),
        Facility(code="WH-ATL", name="Atlanta Regional Center", type="distribution", address="888 Peachtree Logistics", city="Atlanta", state="GA", latitude=33.7490, longitude=-84.3880, capacity_percentage=82, staff_count=145, status="operational"),
        Facility(code="WH-DFW", name="Dallas-Fort Worth Hub", type="hub", address="999 Metroplex Way", city="Dallas", state="TX", latitude=32.7767, longitude=-96.7970, capacity_percentage=65, staff_count=112, status="operational"),
    ]
    db.add_all(facilities)
    db.flush()

    statuses = ["pending", "confirmed", "processing", "shipped", "delivered"]
    priorities = ["low", "medium", "high", "critical"]

    orders_list = []
    for i in range(50):
        customer = random.choice(customers)
        created_days_ago = random.randint(0, 30)
        order = Order(
            order_number=f"ORD-2024-{1001 + i:04d}",
            customer_id=customer.id,
            items_count=random.randint(1, 200),
            total_value=round(random.uniform(1000, 500000), 2),
            priority=random.choice(priorities),
            status=random.choice(statuses),
            created_at=datetime.utcnow() - timedelta(days=created_days_ago),
        )
        orders_list.append(order)
    db.add_all(orders_list)
    db.flush()

    carriers = ["FastFreight", "SpeedyShip", "ReliableLogistics", "CargoExpress", "GlobalTransport"]
    ship_statuses = ["pending", "processing", "in_transit", "delivered", "delayed"]
    locations = [
        ("Los Angeles, CA", "New York, NY"),
        ("Chicago, IL", "Miami, FL"),
        ("Seattle, WA", "Denver, CO"),
        ("Houston, TX", "Atlanta, GA"),
        ("Boston, MA", "Phoenix, AZ"),
        ("San Francisco, CA", "Portland, OR"),
        ("Dallas, TX", "Nashville, TN"),
        ("Philadelphia, PA", "Detroit, MI"),
    ]

    shipments_list = []
    for i in range(80):
        customer = random.choice(customers)
        origin, destination = random.choice(locations)
        created_days_ago = random.randint(0, 14)
        status = random.choice(ship_statuses)
        eta = None
        if status in ["in_transit", "processing"]:
            eta = datetime.utcnow() + timedelta(days=random.randint(1, 7))

        shipment = Shipment(
            tracking_number=f"SHP-2024-{1001 + i:04d}",
            customer_id=customer.id,
            order_id=random.choice(orders_list).id if random.random() > 0.3 else None,
            origin=origin,
            destination=destination,
            carrier=random.choice(carriers),
            weight_kg=round(random.uniform(10, 5000), 1),
            status=status,
            eta=eta,
            created_at=datetime.utcnow() - timedelta(days=created_days_ago),
        )
        shipments_list.append(shipment)
    db.add_all(shipments_list)

    products = [
        ("Industrial Motor Unit", "Machinery"),
        ("Electronic Control Panel", "Electronics"),
        ("Steel Beam Type B", "Materials"),
        ("Medical Supply Kit", "Healthcare"),
        ("Automotive Parts Set", "Automotive"),
        ("Food Grade Container", "Packaging"),
        ("Safety Equipment Bundle", "Safety"),
        ("Chemical Compound X", "Chemicals"),
        ("Organic Grain Bulk", "Food"),
        ("Cotton Fabric Roll", "Textiles"),
        ("Hydraulic Pump", "Machinery"),
        ("Circuit Board Assembly", "Electronics"),
        ("Aluminum Sheet", "Materials"),
        ("Surgical Instrument Set", "Healthcare"),
        ("Brake Pad Kit", "Automotive"),
    ]

    inventory_items = []
    sku_counter = 1001
    for facility in facilities:
        for product_name, category in random.sample(products, k=random.randint(8, 12)):
            quantity = random.randint(0, 3000)
            reorder_point = random.randint(20, 200)
            if quantity == 0:
                status = "out_of_stock"
            elif quantity <= reorder_point:
                status = "low_stock"
            else:
                status = "in_stock"
            item = InventoryItem(
                sku=f"SKU-{sku_counter:06d}",
                name=f"{product_name}",
                category=category,
                facility_id=facility.id,
                quantity=quantity,
                reorder_point=reorder_point,
                unit_price=round(random.uniform(10, 1000), 2),
                status=status,
            )
            inventory_items.append(item)
            sku_counter += 1
    db.add_all(inventory_items)

    truck_names = ["Freightliner Cascadia", "Peterbilt 579", "Kenworth T680", "Volvo VNL 860", "International LT"]
    driver_names = ["Mike Johnson", "Sarah Williams", "John Davis", "Emily Chen", "Robert Brown", "Lisa Garcia"]
    vehicle_statuses = ["en_route", "loading", "idle", "maintenance"]

    vehicles_list = []
    vehicle_counter = 1

    for i in range(15):
        facility = random.choice(facilities)
        status = random.choice(vehicle_statuses)
        current_loc = f"{facility.city}, {facility.state}" if status in ["idle", "loading", "maintenance"] else random.choice(["Interstate 95, NJ", "Highway 66, TX", "I-10, CA"])
        dest = None
        eta = None
        if status == "en_route":
            dest = random.choice([f"{f.city}, {f.state}" for f in facilities if f != facility])
            eta = f"{random.randint(1, 12)} hours"
        vehicle = Vehicle(
            vehicle_id=f"TRK-{vehicle_counter:03d}",
            name=random.choice(truck_names),
            type="truck",
            driver=random.choice(driver_names),
            facility_id=facility.id,
            current_location=current_loc,
            destination=dest,
            status=status,
            fuel_level=random.randint(20, 100),
            eta=eta,
        )
        vehicles_list.append(vehicle)
        vehicle_counter += 1

    ship_names = ["MV Atlantic Voyager", "SS Pacific Star", "MV Global Explorer"]
    for i, name in enumerate(ship_names):
        vehicle = Vehicle(
            vehicle_id=f"SHP-{i+1:03d}",
            name=name,
            type="ship",
            driver=f"Capt. {random.choice(['Anderson', 'Martinez', 'Thompson'])}",
            current_location=random.choice(["Atlantic Ocean", "Pacific Ocean", "Port of Miami"]),
            destination=random.choice(["Port of Miami", "Port of Los Angeles", "Port of Seattle"]),
            status=random.choice(["en_route", "loading", "idle"]),
            fuel_level=random.randint(50, 95),
            eta=f"{random.randint(1, 5)} days" if random.random() > 0.3 else None,
        )
        vehicles_list.append(vehicle)

    plane_names = ["Boeing 747-8F", "Airbus A330-200F"]
    for i, name in enumerate(plane_names):
        vehicle = Vehicle(
            vehicle_id=f"AIR-{i+1:03d}",
            name=name,
            type="plane",
            driver=f"Capt. {random.choice(['Roberts', 'Johnson'])}",
            current_location=random.choice(["Over Pacific", "JFK Airport", "LAX Airport"]),
            destination=random.choice(["LAX Airport", "JFK Airport", "ORD Airport"]),
            status=random.choice(["en_route", "loading", "idle"]),
            fuel_level=random.randint(40, 90),
            eta=f"{random.randint(2, 14)} hours" if random.random() > 0.3 else None,
        )
        vehicles_list.append(vehicle)

    train_names = ["Union Pacific Freight", "BNSF Intermodal"]
    for i, name in enumerate(train_names):
        vehicle = Vehicle(
            vehicle_id=f"TRN-{i+1:03d}",
            name=name,
            type="train",
            driver=f"Engineer {random.choice(['Wilson', 'Taylor'])}",
            current_location=random.choice(["Nebraska", "Kansas", "Chicago Rail Yard"]),
            destination=random.choice(["Chicago Rail Yard", "LA Intermodal", "Houston Terminal"]),
            status=random.choice(["en_route", "loading", "idle"]),
            fuel_level=random.randint(60, 95),
            eta=f"{random.randint(8, 36)} hours" if random.random() > 0.3 else None,
        )
        vehicles_list.append(vehicle)

    db.add_all(vehicles_list)
    db.flush()

    # Seed notifications
    _notification_templates = [  # noqa: F841
        {"title": "Shipment {0} delayed", "type": "warning", "category": "shipment", "ref_type": "shipment"},
        {"title": "Order {0} confirmed", "type": "success", "category": "order", "ref_type": "order"},
        {"title": "Low stock alert: {0}", "type": "warning", "category": "inventory", "ref_type": "inventory"},
        {"title": "Vehicle {0} requires maintenance", "type": "error", "category": "vehicle", "ref_type": "vehicle"},
        {"title": "New order from {0}", "type": "info", "category": "order", "ref_type": "order"},
        {"title": "Shipment {0} delivered successfully", "type": "success", "category": "shipment", "ref_type": "shipment"},
        {"title": "Facility {0} at 90% capacity", "type": "warning", "category": "system", "ref_type": "facility"},
        {"title": "Shipment {0} in transit", "type": "info", "category": "shipment", "ref_type": "shipment"},
        {"title": "Out of stock: {0}", "type": "error", "category": "inventory", "ref_type": "inventory"},
        {"title": "Driver assigned to {0}", "type": "info", "category": "vehicle", "ref_type": "vehicle"},
    ]

    notifications_list = []
    delayed_shipments = [s for s in shipments_list if s.status == "delayed"]
    delivered_shipments = [s for s in shipments_list if s.status == "delivered"]
    in_transit_shipments = [s for s in shipments_list if s.status == "in_transit"]
    low_stock_items = [i for i in inventory_items if i.status == "low_stock"]
    out_of_stock_items = [i for i in inventory_items if i.status == "out_of_stock"]
    maintenance_vehicles = [v for v in vehicles_list if v.status == "maintenance"]
    high_capacity_facilities = [f for f in facilities if f.capacity_percentage >= 80]

    # Generate realistic notifications
    for i, shipment in enumerate(delayed_shipments[:5]):
        notifications_list.append(Notification(
            title=f"Shipment {shipment.tracking_number} delayed",
            message=f"Shipment from {shipment.origin} to {shipment.destination} has been delayed due to weather conditions.",
            type="warning",
            category="shipment",
            reference_id=shipment.id,
            reference_type="shipment",
            read=0 if i < 2 else 1,
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(5, 120)),
        ))

    for i, shipment in enumerate(delivered_shipments[:3]):
        notifications_list.append(Notification(
            title=f"Shipment {shipment.tracking_number} delivered",
            message=f"Shipment has been delivered to {shipment.destination}.",
            type="success",
            category="shipment",
            reference_id=shipment.id,
            reference_type="shipment",
            read=1,
            created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
        ))

    for shipment in in_transit_shipments[:2]:
        notifications_list.append(Notification(
            title=f"Shipment {shipment.tracking_number} in transit",
            message=f"Shipment is currently on the way from {shipment.origin} to {shipment.destination}.",
            type="info",
            category="shipment",
            reference_id=shipment.id,
            reference_type="shipment",
            read=0,
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(30, 180)),
        ))

    for i, item in enumerate(low_stock_items[:4]):
        notifications_list.append(Notification(
            title=f"Low stock alert: {item.name}",
            message=f"Only {item.quantity} units remaining in stock. Reorder point is {item.reorder_point}.",
            type="warning",
            category="inventory",
            reference_id=item.id,
            reference_type="inventory",
            read=0 if i < 2 else 1,
            created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 12)),
        ))

    for item in out_of_stock_items[:2]:
        notifications_list.append(Notification(
            title=f"Out of stock: {item.name}",
            message=f"Item {item.sku} is completely out of stock and needs immediate restocking.",
            type="error",
            category="inventory",
            reference_id=item.id,
            reference_type="inventory",
            read=0,
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(10, 60)),
        ))

    for vehicle in maintenance_vehicles[:2]:
        notifications_list.append(Notification(
            title=f"Vehicle {vehicle.vehicle_id} requires maintenance",
            message=f"{vehicle.name} needs scheduled maintenance.",
            type="error",
            category="vehicle",
            reference_id=vehicle.id,
            reference_type="vehicle",
            read=0,
            created_at=datetime.utcnow() - timedelta(hours=random.randint(2, 8)),
        ))

    for facility in high_capacity_facilities[:2]:
        notifications_list.append(Notification(
            title=f"Facility {facility.code} at {facility.capacity_percentage}% capacity",
            message=f"{facility.name} is approaching full capacity. Consider redistributing inventory.",
            type="warning",
            category="system",
            reference_id=facility.id,
            reference_type="facility",
            read=1,
            created_at=datetime.utcnow() - timedelta(hours=random.randint(4, 48)),
        ))

    # Add some order notifications
    recent_orders = [o for o in orders_list if o.status == "confirmed"][:3]
    for order in recent_orders:
        notifications_list.append(Notification(
            title=f"New order {order.order_number} confirmed",
            message=f"Order worth ${order.total_value:,.2f} with {order.items_count} items has been confirmed.",
            type="success",
            category="order",
            reference_id=order.id,
            reference_type="order",
            read=1,
            created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 6)),
        ))

    db.add_all(notifications_list)
    db.commit()
    db.close()

    print("Database seeded successfully!")
    print(f"  - {len(users)} users")
    print(f"  - {len(customers)} customers")
    print(f"  - {len(facilities)} facilities")
    print(f"  - {len(orders_list)} orders")
    print(f"  - {len(shipments_list)} shipments")
    print(f"  - {len(inventory_items)} inventory items")
    print(f"  - {len(vehicles_list)} vehicles")
    print(f"  - {len(notifications_list)} notifications")


if __name__ == "__main__":
    seed_database()
