# AGENTS.md

This document provides essential information for AI agents working with the Acme Logistics codebase.

## Project Overview

Enterprise logistics management platform with a monorepo architecture:
- **Frontend**: Next.js 16 + React 19 (TypeScript)
- **Backend**: FastAPI + SQLAlchemy (Python)

## Quick Commands

### Setup
```bash
# Install all dependencies
pnpm setup

# Seed database with demo data
pnpm seed
```

### Development
```bash
# Start both frontend and backend
pnpm dev

# Start frontend only (port 3000)
pnpm dev:frontend

# Start backend only (port 8000)
pnpm dev:backend
```

### Build & Lint
```bash
# Build frontend for production
pnpm build

# Run frontend linting
pnpm lint

# Format frontend code
pnpm format
```

### Testing
```bash
# Run all tests
pnpm test

# Run frontend tests
pnpm test:frontend

# Run backend tests
pnpm test:backend
```

### Database
```bash
# Reset and reseed database
pnpm db:reset
```

## Project Structure

```
acme-logistics/
├── frontend/                 # Next.js application
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utilities and API client
│   │   ├── api.ts            # Typed API client
│   │   ├── utils.ts          # Helper functions
│   │   └── locations.ts      # Geo coordinates
│   └── hooks/                # Custom React hooks
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/v1/routes/    # API route handlers
│   │   ├── db/               # Database setup
│   │   ├── models/           # SQLAlchemy ORM models
│   │   └── schemas/          # Pydantic validation schemas
│   ├── tests/                # Python tests
│   ├── main.py               # FastAPI entry point
│   └── seed.py               # Database seeder
└── .github/workflows/        # CI/CD pipelines
```

## Code Conventions

### Frontend (TypeScript)
- Use functional components with hooks
- Styling: Tailwind CSS with shadcn/ui components
- API calls via `lib/api.ts` typed client
- Status colors defined in `lib/utils.ts`
- Format with Prettier, lint with ESLint

### Backend (Python)
- FastAPI routes in `app/api/v1/routes/`
- SQLAlchemy 2.0 with mapped_column syntax
- Pydantic v2 schemas for validation
- Format with Black, lint with Ruff

## API Endpoints

All endpoints prefixed with `/api/v1/`:
- `/dashboard/*` - Dashboard stats and metrics
- `/customers` - Customer management
- `/facilities` - Warehouse/hub management
- `/orders` - Order management
- `/shipments` - Shipment tracking
- `/inventory` - Stock management
- `/vehicles` - Fleet management
- `/users` - User management
- `/notifications` - Alert system
- `/search` - Global search

## Data Models

| Model | Purpose |
|-------|---------|
| Customer | Clients with orders/shipments |
| Facility | Warehouses, hubs, ports (with geo) |
| Order | Customer orders with priority/status |
| Shipment | Tracked packages linked to orders |
| InventoryItem | Stock at facilities |
| Vehicle | Fleet with driver, location, fuel |
| User | System users with roles |
| Notification | Alerts tied to entities |

## Environment

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: SQLite (backend/acme_logistics.db)

## Testing Strategy

- **Frontend**: Vitest for unit tests, React Testing Library for components
- **Backend**: pytest for API and unit tests
- Run `pnpm test` to execute all tests before committing

## Important Notes

1. Always run `pnpm lint` before committing frontend changes
2. Backend uses SQLite for simplicity - no external DB setup needed
3. Seed data can be reset with `pnpm db:reset`
4. The command palette (Cmd+K) provides quick navigation
