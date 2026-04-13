from app.models import models
from app.services.inventory_alerts import sync_low_stock_notification


def test_sync_low_stock_notification_creates_notification(test_db, sample_inventory):
    sample_inventory.quantity = 5
    sample_inventory.status = "low_stock"

    notification = sync_low_stock_notification(test_db, sample_inventory)
    test_db.commit()

    assert notification is not None
    test_db.refresh(notification)
    assert notification.category == "inventory"
    assert notification.reference_id == sample_inventory.id
    assert notification.type == "warning"


def test_sync_low_stock_notification_deduplicates_unread_notifications(test_db, sample_inventory):
    sample_inventory.quantity = 5
    sample_inventory.status = "low_stock"

    first_notification = sync_low_stock_notification(test_db, sample_inventory)
    test_db.commit()
    second_notification = sync_low_stock_notification(test_db, sample_inventory)
    test_db.commit()

    notifications = (
        test_db.query(models.Notification)
        .filter(
            models.Notification.reference_type == "inventory",
            models.Notification.reference_id == sample_inventory.id,
        )
        .all()
    )

    assert first_notification is not None
    assert second_notification is None
    assert len(notifications) == 1


def test_sync_low_stock_notification_marks_existing_notification_read(test_db, sample_inventory):
    sample_inventory.quantity = 5
    sample_inventory.status = "low_stock"
    notification = sync_low_stock_notification(test_db, sample_inventory)
    test_db.commit()

    sample_inventory.quantity = 30
    sample_inventory.status = "in_stock"
    sync_low_stock_notification(test_db, sample_inventory)
    test_db.commit()

    test_db.refresh(notification)
    assert bool(notification.read) is True
