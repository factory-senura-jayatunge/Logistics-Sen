# Acme Logistics

Enterprise logistics management platform demo application.

## Architecture Overview

**Monorepo** using pnpm workspaces with:
- **Backend**: Python FastAPI (port 8000)
- **Frontend**: Next.js 16 with React 19 (port 3000)

## Tech Stack

### Frontend
- **Framework**: Next.js 16, React 19
- **Styling**: Tailwind CSS 4, Radix UI, shadcn/ui, Lucide icons
- **Maps**: Leaflet + react-leaflet
- **Charts**: Recharts
- **Theme**: next-themes

### Backend
- **Framework**: FastAPI with uvicorn
- **ORM**: SQLAlchemy 2.0
- **Database**: SQLite
- **Validation**: Pydantic

## Quick Start

```bash
# Install dependencies
pnpm setup

# Seed database with demo data
pnpm seed

# Start both frontend and backend
pnpm dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both frontend and backend concurrently |
| `pnpm dev:frontend` | Start frontend only |
| `pnpm dev:backend` | Start backend only |
| `pnpm setup` | Install all dependencies |
| `pnpm seed` | Seed database with mock data |
| `pnpm db:reset` | Reset and reseed database |
| `pnpm build` | Build frontend for production |
| `pnpm lint` | Run frontend linting |

## Project Structure

```
acme-logistics/
├── frontend/                    # Next.js application
│   ├── app/                     # App router pages
│   │   ├── dashboard/           # Main stats/overview
│   │   ├── orders/              # Order management
│   │   ├── shipments/           # Shipment tracking
│   │   ├── inventory/           # Stock management
│   │   ├── facilities/          # Warehouse/hub details
│   │   ├── fleet/               # Vehicle management
│   │   ├── settings/            # App settings
│   │   ├── layout.tsx           # Root layout with sidebar + header
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── app-sidebar.tsx      # Navigation sidebar
│   │   ├── header.tsx           # Top header with search/notifications
│   │   ├── command-menu.tsx     # Cmd+K command palette
│   │   ├── new-order-modal.tsx  # Order creation modal
│   │   └── new-shipment-modal.tsx
│   ├── lib/
│   │   ├── api.ts               # Typed API client + interfaces
│   │   └── utils.ts             # Helper functions
│   └── hooks/                   # Custom React hooks
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── api/v1/routes/       # API route handlers
│   │   │   ├── customers.py
│   │   │   ├── facilities.py
│   │   │   ├── orders.py
│   │   │   ├── shipments.py
│   │   │   ├── inventory.py
│   │   │   ├── vehicles.py
│   │   │   ├── users.py
│   │   │   ├── notifications.py
│   │   │   ├── dashboard.py
│   │   │   └── search.py
│   │   ├── db/
│   │   │   └── database.py      # SQLAlchemy setup
│   │   ├── models/
│   │   │   └── models.py        # SQLAlchemy ORM models
│   │   └── schemas/
│   │       └── schemas.py       # Pydantic validation schemas
│   ├── main.py                  # FastAPI entry point
│   ├── seed.py                  # Database seeder
│   └── acme_logistics.db        # SQLite database file
└── package.json                 # Monorepo scripts
```

## Data Models

| Model | Description |
|-------|-------------|
| **Customer** | Clients with orders and shipments |
| **Facility** | Warehouses, hubs, distribution centers (with geo coordinates) |
| **Order** | Customer orders with priority and status tracking |
| **Shipment** | Tracked packages linked to orders |
| **InventoryItem** | Stock items at facilities with reorder points |
| **Vehicle** | Trucks, ships, planes with driver, location, fuel level |
| **User** | System users with roles (admin, dispatcher, driver, etc.) |
| **Notification** | Alerts tied to entities (orders, shipments, inventory) |

## API Endpoints

All endpoints are prefixed with `/api/v1/`:

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/dashboard/stats` | GET | Dashboard KPIs and metrics |
| `/dashboard/recent-shipments` | GET | Recent shipment activity |
| `/dashboard/shipment-status-breakdown` | GET | Shipment status distribution |
| `/dashboard/shipment-volume` | GET | Shipment volume over time |
| `/customers` | GET, POST | Customer management |
| `/facilities` | GET, POST | Facility management |
| `/facilities/:id` | GET | Facility details with inventory/vehicles |
| `/orders` | GET, POST | Order management |
| `/orders/:id` | GET | Order details with shipments |
| `/shipments` | GET, POST | Shipment tracking |
| `/shipments/:id` | GET | Shipment details |
| `/inventory` | GET | Inventory items |
| `/inventory/low-stock` | GET | Low stock alerts |
| `/vehicles` | GET | Fleet management |
| `/vehicles/:id` | GET | Vehicle details |
| `/users` | GET | User management |
| `/notifications` | GET | User notifications |
| `/notifications/unread-count` | GET | Unread notification count |
| `/search` | GET | Global search across entities |

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Redirects to dashboard |
| `/dashboard` | Main stats, charts, and recent activity |
| `/orders` | Order list with filtering |
| `/orders/[id]` | Order details with linked shipments |
| `/shipments` | Shipment list with status tracking |
| `/shipments/[id]` | Shipment details and timeline |
| `/inventory` | Stock levels across facilities |
| `/inventory/[id]` | Inventory item details |
| `/facilities` | Warehouse and hub overview |
| `/facilities/[id]` | Facility details with inventory/vehicles |
| `/fleet` | Vehicle fleet management |
| `/fleet/[id]` | Vehicle details and status |
| `/settings` | Application settings |