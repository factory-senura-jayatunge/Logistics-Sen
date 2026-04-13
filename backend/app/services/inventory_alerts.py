from typing import Optional

from sqlalchemy.orm import Session

from app.logging import get_logger
from app.models import models

logger = get_logger("inventory_alerts")


def is_low_stock(item: models.InventoryItem) -> bool:
    return item.quantity <= item.reorder_point


def sync_low_stock_notification(
    db: Session, item: models.InventoryItem
) -> Optional[models.Notification]:
    unread_notifications = (
        db.query(models.Notification)
        .filter(
            models.Notification.reference_type == "inventory",
            models.Notification.reference_id == item.id,
            models.Notification.read == 0,
        )
        .all()
    )

    if not is_low_stock(item):
        if unread_notifications:
            for notification in unread_notifications:
                notification.read = 1
            logger.info(
                "inventory_low_stock_resolved",
                item_id=item.id,
                resolved_notifications=len(unread_notifications),
            )
        return None

    if unread_notifications:
        return None

    facility = item.facility
    facility_name = facility.name if facility else f"Facility {item.facility_id}"
    is_out_of_stock = item.quantity == 0

    notification = models.Notification(
        title=(
            f"Out of Stock: {item.name} ({item.sku})"
            if is_out_of_stock
            else f"Low Stock: {item.name} ({item.sku})"
        ),
        message=(
            f"Current quantity ({item.quantity}) is below reorder point "
            f"({item.reorder_point}) at {facility_name}"
        ),
        type="error" if is_out_of_stock else "warning",
        category="inventory",
        reference_id=item.id,
        reference_type="inventory",
        read=0,
    )
    db.add(notification)

    logger.info(
        "inventory_low_stock_notification_created",
        item_id=item.id,
        sku=item.sku,
        quantity=item.quantity,
        reorder_point=item.reorder_point,
        notification_type=notification.type,
    )

    return notification
