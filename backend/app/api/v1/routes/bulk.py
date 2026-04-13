import csv
import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/bulk", tags=["bulk"])


# ============ ORDERS ============


@router.post("/orders/delete", response_model=schemas.BulkOperationResult)
def bulk_delete_orders(request: schemas.BulkDeleteRequest, db: Session = Depends(get_db)):
    success_count = 0
    failed_count = 0
    errors = []

    for order_id in request.ids:
        try:
            order = db.query(models.Order).filter(models.Order.id == order_id).first()
            if order:
                db.delete(order)
                success_count += 1
            else:
                failed_count += 1
                errors.append({"id": order_id, "error": "Order not found"})
        except Exception as e:
            failed_count += 1
            errors.append({"id": order_id, "error": str(e)})

    db.commit()
    return schemas.BulkOperationResult(
        success_count=success_count, failed_count=failed_count, errors=errors
    )


@router.patch("/orders/status", response_model=schemas.BulkOperationResult)
def bulk_update_order_status(
    request: schemas.BulkStatusUpdateRequest, db: Session = Depends(get_db)
):
    success_count = 0
    failed_count = 0
    errors = []

    for order_id in request.ids:
        try:
            order = db.query(models.Order).filter(models.Order.id == order_id).first()
            if order:
                order.status = request.status
                success_count += 1
            else:
                failed_count += 1
                errors.append({"id": order_id, "error": "Order not found"})
        except Exception as e:
            failed_count += 1
            errors.append({"id": order_id, "error": str(e)})

    db.commit()
    return schemas.BulkOperationResult(
        success_count=success_count, failed_count=failed_count, errors=errors
    )


@router.get("/orders/export")
def export_orders(db: Session = Depends(get_db)):
    orders = db.query(models.Order).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "order_number",
            "customer_id",
            "items_count",
            "total_value",
            "priority",
            "status",
            "created_at",
        ]
    )

    for order in orders:
        writer.writerow(
            [
                order.id,
                order.order_number,
                order.customer_id,
                order.items_count,
                order.total_value,
                order.priority,
                order.status,
                order.created_at.isoformat(),
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders.csv"},
    )


@router.post("/orders/import", response_model=schemas.CSVImportResult)
async def import_orders(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    imported = 0
    skipped = 0
    errors = []

    order_count = db.query(models.Order).count()

    for row_num, row in enumerate(reader, start=2):
        try:
            order_count += 1
            order_number = f"ORD-2024-{order_count:04d}"
            order = models.Order(
                order_number=order_number,
                customer_id=int(row["customer_id"]),
                items_count=int(row["items_count"]),
                total_value=float(row["total_value"]),
                priority=row.get("priority", "medium"),
                status=row.get("status", "pending"),
            )
            db.add(order)
            imported += 1
        except Exception as e:
            skipped += 1
            errors.append({"row": row_num, "error": str(e)})

    db.commit()
    return schemas.CSVImportResult(imported=imported, skipped=skipped, errors=errors)


# ============ SHIPMENTS ============


@router.post("/shipments/delete", response_model=schemas.BulkOperationResult)
def bulk_delete_shipments(request: schemas.BulkDeleteRequest, db: Session = Depends(get_db)):
    success_count = 0
    failed_count = 0
    errors = []

    for shipment_id in request.ids:
        try:
            shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
            if shipment:
                db.delete(shipment)
                success_count += 1
            else:
                failed_count += 1
                errors.append({"id": shipment_id, "error": "Shipment not found"})
        except Exception as e:
            failed_count += 1
            errors.append({"id": shipment_id, "error": str(e)})

    db.commit()
    return schemas.BulkOperationResult(
        success_count=success_count, failed_count=failed_count, errors=errors
    )


@router.patch("/shipments/status", response_model=schemas.BulkOperationResult)
def bulk_update_shipment_status(
    request: schemas.BulkStatusUpdateRequest, db: Session = Depends(get_db)
):
    success_count = 0
    failed_count = 0
    errors = []

    for shipment_id in request.ids:
        try:
            shipment = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
            if shipment:
                shipment.status = request.status
                success_count += 1
            else:
                failed_count += 1
                errors.append({"id": shipment_id, "error": "Shipment not found"})
        except Exception as e:
            failed_count += 1
            errors.append({"id": shipment_id, "error": str(e)})

    db.commit()
    return schemas.BulkOperationResult(
        success_count=success_count, failed_count=failed_count, errors=errors
    )


@router.get("/shipments/export")
def export_shipments(db: Session = Depends(get_db)):
    shipments = db.query(models.Shipment).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "tracking_number",
            "customer_id",
            "order_id",
            "origin",
            "destination",
            "carrier",
            "weight_kg",
            "status",
            "eta",
            "created_at",
        ]
    )

    for shipment in shipments:
        writer.writerow(
            [
                shipment.id,
                shipment.tracking_number,
                shipment.customer_id,
                shipment.order_id or "",
                shipment.origin,
                shipment.destination,
                shipment.carrier,
                shipment.weight_kg,
                shipment.status,
                shipment.eta.isoformat() if shipment.eta else "",
                shipment.created_at.isoformat(),
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=shipments.csv"},
    )


@router.post("/shipments/import", response_model=schemas.CSVImportResult)
async def import_shipments(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    imported = 0
    skipped = 0
    errors = []

    shipment_count = db.query(models.Shipment).count()

    for row_num, row in enumerate(reader, start=2):
        try:
            shipment_count += 1
            tracking_number = f"TRK-{shipment_count:06d}"
            shipment = models.Shipment(
                tracking_number=tracking_number,
                customer_id=int(row["customer_id"]),
                order_id=int(row["order_id"]) if row.get("order_id") else None,
                origin=row["origin"],
                destination=row["destination"],
                carrier=row["carrier"],
                weight_kg=float(row["weight_kg"]),
                status=row.get("status", "pending"),
            )
            db.add(shipment)
            imported += 1
        except Exception as e:
            skipped += 1
            errors.append({"row": row_num, "error": str(e)})

    db.commit()
    return schemas.CSVImportResult(imported=imported, skipped=skipped, errors=errors)


# ============ INVENTORY ============


@router.post("/inventory/delete", response_model=schemas.BulkOperationResult)
def bulk_delete_inventory(request: schemas.BulkDeleteRequest, db: Session = Depends(get_db)):
    success_count = 0
    failed_count = 0
    errors = []

    for item_id in request.ids:
        try:
            item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
            if item:
                db.delete(item)
                success_count += 1
            else:
                failed_count += 1
                errors.append({"id": item_id, "error": "Inventory item not found"})
        except Exception as e:
            failed_count += 1
            errors.append({"id": item_id, "error": str(e)})

    db.commit()
    return schemas.BulkOperationResult(
        success_count=success_count, failed_count=failed_count, errors=errors
    )


@router.get("/inventory/export")
def export_inventory(db: Session = Depends(get_db)):
    items = db.query(models.InventoryItem).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "sku",
            "name",
            "category",
            "facility_id",
            "quantity",
            "reorder_point",
            "unit_price",
            "status",
            "created_at",
        ]
    )

    for item in items:
        writer.writerow(
            [
                item.id,
                item.sku,
                item.name,
                item.category,
                item.facility_id,
                item.quantity,
                item.reorder_point,
                item.unit_price,
                item.status,
                item.created_at.isoformat(),
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=inventory.csv"},
    )


@router.post("/inventory/import", response_model=schemas.CSVImportResult)
async def import_inventory(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    imported = 0
    skipped = 0
    errors = []

    for row_num, row in enumerate(reader, start=2):
        try:
            item = models.InventoryItem(
                sku=row["sku"],
                name=row["name"],
                category=row["category"],
                facility_id=int(row["facility_id"]),
                quantity=int(row.get("quantity", 0)),
                reorder_point=int(row.get("reorder_point", 0)),
                unit_price=float(row.get("unit_price", 0)),
                status=row.get("status", "in_stock"),
            )
            db.add(item)
            imported += 1
        except Exception as e:
            skipped += 1
            errors.append({"row": row_num, "error": str(e)})

    db.commit()
    return schemas.CSVImportResult(imported=imported, skipped=skipped, errors=errors)
