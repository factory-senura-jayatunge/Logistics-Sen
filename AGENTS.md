# AGENTS.md

This file provides guidance for AI agents working with the Acme Logistics codebase.

## Project Overview

Enterprise logistics management platform - a monorepo with a Python FastAPI backend and Next.js React frontend.

## Architecture

```
logistics-app/
├── backend/          # Python FastAPI (port 8000)
├── frontend/         # Next.js 16 + React 19 (port 3000)
├── package.json      # Monorepo scripts (pnpm workspaces)
└── pnpm-workspace.yaml
```

## Tech Stack

### Backend
- **Runtime**: Python 3.9+
- **Framework**: FastAPI with uvicorn
- **ORM**: SQLAlchemy 2.0
- **Database**: SQLite (`backend/acme_logistics.db`)
- **Validation**: Pydantic

### Frontend
- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS 4, shadcn/ui, Radix UI
- **Maps**: Leaflet + react-leaflet
- **Charts**: Recharts
- **Icons**: Lucide React

## Development Commands

```bash
# Install all dependencies
pnpm setup

# Start both services
pnpm dev

# Individual services
pnpm dev:frontend    # Next.js on :3000
pnpm dev:backend     # FastAPI on :8000

# Build & Lint
pnpm build           # Build frontend
pnpm lint            # ESLint frontend

# Database
pnpm seed            # Seed with demo data
pnpm db:reset        # Reset and reseed database
```

## Key Directories

### Backend (`backend/`)
- `main.py` - FastAPI entry point
- `seed.py` - Database seeder with mock data
- `app/api/v1/routes/` - API route handlers (customers, orders, shipments, inventory, vehicles, facilities, dashboard, search, notifications, users)
- `app/models/models.py` - SQLAlchemy ORM models
- `app/schemas/schemas.py` - Pydantic validation schemas
- `app/db/database.py` - Database configuration

### Frontend (`frontend/`)
- `app/` - Next.js App Router pages (dashboard, orders, shipments, inventory, facilities, fleet, settings)
- `components/` - React components
- `components/ui/` - shadcn/ui base components
- `lib/api.ts` - Typed API client with interfaces
- `lib/utils.ts` - Helper utilities

## API Structure

All backend endpoints are prefixed with `/api/v1/`. Key endpoints:
- `/dashboard/*` - Dashboard stats, metrics, charts data
- `/orders`, `/orders/:id` - Order CRUD
- `/shipments`, `/shipments/:id` - Shipment tracking
- `/inventory`, `/inventory/low-stock` - Stock management
- `/vehicles`, `/vehicles/:id` - Fleet management
- `/facilities`, `/facilities/:id` - Warehouse/hub management
- `/customers` - Customer management
- `/search` - Global search
- `/notifications` - User notifications

API documentation available at `http://localhost:8000/docs` when backend is running.

## Data Models

Core entities: Customer, Facility, Order, Shipment, InventoryItem, Vehicle, User, Notification. See `backend/app/models/models.py` for schema details.

## Code Conventions

### Backend (Python)
- Use type hints for function parameters and returns
- Pydantic models for request/response validation
- SQLAlchemy ORM for database operations
- Route handlers in separate files per resource

### Frontend (TypeScript/React)
- TypeScript for all code
- Functional components with hooks
- shadcn/ui components for UI primitives
- API types defined in `lib/api.ts`
- Tailwind CSS for styling (no CSS modules)
- App Router conventions (page.tsx, layout.tsx)

## Testing

Currently no automated tests in the repository. When adding tests:
- Backend: Use pytest with the `.venv` virtual environment
- Frontend: Use Jest or Vitest with React Testing Library

## Environment Setup

Backend uses a Python virtual environment at `backend/.venv`. The setup script creates this automatically via `pnpm setup`.

No environment variables required for local development - the app uses SQLite with default configuration.

## Common Tasks

### Adding a new API endpoint
1. Add route handler in `backend/app/api/v1/routes/`
2. Register route in `backend/app/api/v1/__init__.py`
3. Add Pydantic schemas in `backend/app/schemas/schemas.py` if needed
4. Add TypeScript types in `frontend/lib/api.ts`

### Adding a new frontend page
1. Create directory in `frontend/app/`
2. Add `page.tsx` for the route
3. Update navigation in `frontend/components/app-sidebar.tsx`

### Adding a new UI component
1. Use shadcn CLI or create in `frontend/components/`
2. Follow existing component patterns
3. Use Radix UI primitives where applicable
