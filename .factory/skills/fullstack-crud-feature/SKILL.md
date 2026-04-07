---
name: fullstack-crud-feature
description: Add a new CRUD resource end-to-end across backend (FastAPI/SQLAlchemy) and frontend (Next.js/React). Use when creating new entities like reports, alerts, or routes.
---

# Fullstack CRUD Feature

Add a complete CRUD resource following project conventions.

## Required Inputs

- **Resource name** (singular): e.g., `report`, `alert`, `route`
- **Fields**: List of fields with types
- **Relationships**: Any foreign keys to existing models (Customer, Facility, Order, etc.)
- **Has status workflow?**: Whether it needs status colors/badges

## Instructions

### Phase 1: Backend

#### 1. Add SQLAlchemy Model

Edit `backend/app/models/models.py`:

```python
class ResourceName(Base):
    __tablename__ = "resource_names"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Add fields following existing patterns
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())

    # Relationships (if needed)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    customer: Mapped["Customer"] = relationship(back_populates="resource_names")
```

#### 2. Add Pydantic Schemas

Edit `backend/app/schemas/schemas.py`:

```python
# Base schema with shared fields
class ResourceNameBase(BaseModel):
    field1: str
    field2: Optional[str] = None

# Create schema (fields needed for POST)
class ResourceNameCreate(ResourceNameBase):
    pass

# Response schema (includes id, timestamps)
class ResourceName(ResourceNameBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# With relationships (if needed)
class ResourceNameWithRelations(ResourceName):
    customer: Customer
```

#### 3. Create FastAPI Router

Create `backend/app/api/v1/routes/resource_names.py`:

```python
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.db.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/resource-names", tags=["resource-names"])

@router.get("/", response_model=list[schemas.ResourceName])
def get_resource_names(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ResourceName).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=schemas.ResourceNameWithRelations)
def get_resource_name(id: int, db: Session = Depends(get_db)):
    item = db.query(models.ResourceName).filter(models.ResourceName.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Resource not found")
    return item

@router.post("/", response_model=schemas.ResourceName, status_code=201)
def create_resource_name(data: schemas.ResourceNameCreate, db: Session = Depends(get_db)):
    db_item = models.ResourceName(**data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{id}", response_model=schemas.ResourceName)
def update_resource_name(id: int, data: schemas.ResourceNameCreate, db: Session = Depends(get_db)):
    db_item = db.query(models.ResourceName).filter(models.ResourceName.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Resource not found")
    for key, value in data.model_dump().items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{id}")
def delete_resource_name(id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.ResourceName).filter(models.ResourceName.id == id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Deleted"}
```

#### 4. Register Router

Edit `backend/main.py`:

```python
from app.api.v1.routes import resource_names
app.include_router(resource_names.router, prefix="/api/v1")
```

### Phase 2: Frontend

#### 5. Add API Client Functions

Edit `frontend/lib/api.ts`:

```typescript
// Types
export interface ResourceName {
  id: number
  field1: string
  field2: string | null
  created_at: string
  updated_at: string
}

export interface ResourceNameCreate {
  field1: string
  field2?: string
}

// API Functions
export async function getResourceNames(): Promise<ResourceName[]> {
  const res = await fetch(`${API_BASE}/resource-names`)
  if (!res.ok) throw new Error("Failed to fetch resource names")
  return res.json()
}

export async function getResourceName(id: number): Promise<ResourceName> {
  const res = await fetch(`${API_BASE}/resource-names/${id}`)
  if (!res.ok) throw new Error("Failed to fetch resource name")
  return res.json()
}

export async function createResourceName(data: ResourceNameCreate): Promise<ResourceName> {
  const res = await fetch(`${API_BASE}/resource-names`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create resource name")
  return res.json()
}
```

#### 6. Add Status Colors (if applicable)

Edit `frontend/lib/utils.ts`:

```typescript
export const resourceNameStatusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  inactive: "bg-neutral/10 text-neutral border-neutral/20",
}
```

#### 7. Create List Page

Create `frontend/app/resource-names/page.tsx` following `orders/page.tsx` pattern:
- Data table with columns
- Status badges using theme colors
- Link to detail page

#### 8. Create Detail Page

Create `frontend/app/resource-names/[id]/page.tsx` following `orders/[id]/page.tsx` pattern:
- Fetch single resource
- Display all fields in cards
- Back navigation

#### 9. Add to Sidebar Navigation

Edit `frontend/components/app-sidebar.tsx` to add navigation item.

## Verification

Run before completing:

```bash
# Backend
pnpm test:backend
cd backend && .venv/bin/ruff check .

# Frontend  
pnpm lint
pnpm build

# Manual test
pnpm dev
# Visit /resource-names and verify CRUD works
```

## Reference Files

- Model example: `backend/app/models/models.py` (Order, Shipment)
- Schema example: `backend/app/schemas/schemas.py` (OrderWithCustomer)
- Route example: `backend/app/api/v1/routes/orders.py`
- List page: `frontend/app/orders/page.tsx`
- Detail page: `frontend/app/orders/[id]/page.tsx`
- API client: `frontend/lib/api.ts`
