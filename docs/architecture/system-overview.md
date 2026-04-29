# System Overview

Acme Logistics is an enterprise logistics management platform built as a
pnpm-managed monorepo with a Python FastAPI backend and a Next.js / React
frontend. This document describes the high-level architecture, the major
components, and how they interact at runtime.

## High-Level Architecture

```mermaid
flowchart LR
    User([Operator / Dispatcher])

    subgraph Browser["Browser (Next.js 16 + React 19)"]
        Pages["App Router Pages<br/>frontend/app/*"]
        Components["UI Components<br/>components/ui, app-sidebar, command-menu"]
        ApiClient["Typed API Client<br/>frontend/lib/api.ts"]
        WsClient["WebSocket Client<br/>hooks/use-shipment-socket"]
    end

    subgraph Backend["FastAPI Backend (port 8000)"]
        Routes["REST Routes<br/>backend/app/api/v1/routes/*"]
        Schemas["Pydantic Schemas<br/>backend/app/schemas/*"]
        Models["SQLAlchemy Models<br/>backend/app/models/models.py"]
        Services["Domain Services<br/>backend/app/services/*"]
        WsManager["WebSocket Manager<br/>backend/app/ws/manager.py"]
        Scheduler["Inventory Scan Loop<br/>background thread in main.py"]
        Logging["Structured Logger<br/>backend/app/logging.py"]
    end

    DB[("SQLite<br/>backend/acme_logistics.db")]

    User -->|HTTPS / HTTP| Pages
    Pages --> Components
    Pages --> ApiClient
    Pages --> WsClient
    ApiClient -->|JSON over HTTP<br/>/api/v1/*| Routes
    WsClient -.->|WebSocket<br/>/ws/shipments/:id| WsManager

    Routes --> Schemas
    Routes --> Services
    Routes --> Models
    Services --> Models
    Models --> DB
    Scheduler -.->|scheduled scan| Services
    Services -.->|broadcast| WsManager
    Routes --> Logging
    Services --> Logging
```

## Request Routing

- **Frontend origin**: `http://localhost:3000`
- **Backend origin**: `http://localhost:8000`
- **API prefix**: `/api/v1`
- **WebSocket path**: `/ws/shipments/{shipment_id}`
- **OpenAPI docs**: `http://localhost:8000/docs`

CORS is configured in `backend/main.py` to allow the Next.js dev origin
(`http://localhost:3000` and `http://127.0.0.1:3000`). Update that middleware
when adding new frontend origins.

## Technology Stack

### Frontend

| Concern | Library |
|---------|---------|
| Framework | Next.js 16 (App Router) |
| UI Runtime | React 19 |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI |
| Icons | Lucide |
| Charts | Recharts |
| Maps | Leaflet + react-leaflet |
| Theme | next-themes |
| Tests | Vitest + React Testing Library |
| Lint / Format | ESLint, Prettier |

### Backend

| Concern | Library |
|---------|---------|
| Framework | FastAPI + uvicorn |
| ORM | SQLAlchemy 2.0 (`mapped_column` style) |
| Validation | Pydantic v2 |
| Database | SQLite (file-based, `acme_logistics.db`) |
| Lint / Format | Ruff, Black |
| Tests | pytest |

### Tooling & CI

| Concern | Tool |
|---------|------|
| Monorepo | pnpm workspaces |
| Git hooks | Husky |
| Dependency health | Syncpack, Knip |
| Release | release-please |
| Dependency updates | Renovate |
| Secret scanning | Gitleaks (see `.gitleaks.toml`) |
| CI | GitHub Actions (`.github/workflows/`) |
| E2E | Playwright (`e2e/`, `playwright.config.ts`) |

## Deployment Topology (Local Dev)

```mermaid
flowchart TB
    Dev([Developer Machine])

    subgraph Node["Node process (pnpm dev:frontend)"]
        Next["Next.js dev server<br/>:3000"]
    end

    subgraph Py["Python process (pnpm dev:backend)"]
        Uvicorn["uvicorn<br/>FastAPI app<br/>:8000"]
        BG["Inventory scan<br/>background thread"]
    end

    File[("acme_logistics.db<br/>SQLite file")]

    Dev --> Next
    Dev --> Uvicorn
    Next -->|fetch /api/v1/*| Uvicorn
    Next -->|ws /ws/shipments/:id| Uvicorn
    Uvicorn --> File
    BG --> File
```

- The backend runs as a single uvicorn process. A background thread periodically
  scans inventory for low-stock items (see `backend/main.py::inventory_scan_loop`).
- SQLite is embedded, so there is no separate database server in local dev.
  Resetting state is as simple as `pnpm db:reset`.
- Production deployment targets are documented in `docs/runbooks/` (API outage,
  DB issues, frontend deploy failure).

## Major Subsystems

| Subsystem | Location | Responsibility |
|-----------|----------|----------------|
| API Routes | `backend/app/api/v1/routes/` | HTTP endpoints for dashboard, customers, facilities, orders, shipments, inventory, vehicles, users, notifications, search, bulk, analytics, route planning, forecasting |
| Domain Services | `backend/app/services/` | Cross-route business logic such as `inventory_alerts.sync_low_stock_notification` |
| Persistence | `backend/app/db/database.py`, `backend/app/models/models.py` | SQLAlchemy engine, session factory, ORM models |
| Validation | `backend/app/schemas/` | Pydantic request/response DTOs |
| Realtime | `backend/app/ws/manager.py` | Connection registry and broadcast helpers for shipment updates |
| Background Jobs | `backend/main.py` (`inventory_scan_loop`) | Scheduled rescan of inventory for low-stock notifications |
| Frontend Pages | `frontend/app/` | Dashboard, orders, shipments, inventory, facilities, fleet, settings |
| Frontend API Client | `frontend/lib/api.ts` | Typed `fetch` wrapper with logging and error propagation |
| Seeding | `backend/seed.py` | Generates demo customers, facilities, orders, shipments, inventory, vehicles, users, notifications |

See [Service Dependencies](./service-dependencies.md) for the full internal and
external dependency inventory, and [Request Flows](./request-flows.md) for
sequence diagrams of key user journeys.
