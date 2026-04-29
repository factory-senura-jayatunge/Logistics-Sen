# Request Flows

Sequence diagrams for the most important user and system flows in the Acme
Logistics platform. Use these as the authoritative reference when tracing how a
feature works end-to-end.

## 1. Loading the Dashboard

When an operator opens `/dashboard`, the Next.js page makes parallel requests to
the FastAPI backend through the typed client in `frontend/lib/api.ts`.

```mermaid
sequenceDiagram
    autonumber
    actor User as Operator
    participant Browser as Next.js Page<br/>(app/dashboard)
    participant Api as lib/api.ts
    participant BE as FastAPI Router<br/>(/api/v1/dashboard)
    participant DB as SQLite

    User->>Browser: Navigate to /dashboard
    Browser->>Api: getDashboardStats()
    Browser->>Api: getRecentShipments(5)
    Browser->>Api: getShipmentStatusBreakdown()
    Browser->>Api: getShipmentVolume(30)
    par Parallel HTTP requests
        Api->>BE: GET /api/v1/dashboard/stats
        BE->>DB: aggregate counts (orders, shipments, inventory, vehicles)
        DB-->>BE: totals
        BE-->>Api: DashboardStats JSON
    and
        Api->>BE: GET /api/v1/dashboard/recent-shipments?limit=5
        BE->>DB: SELECT shipments ORDER BY created_at DESC LIMIT 5
        DB-->>BE: rows
        BE-->>Api: Shipment[] JSON
    and
        Api->>BE: GET /api/v1/dashboard/shipment-status-breakdown
        BE->>DB: GROUP BY status
        DB-->>BE: counts
        BE-->>Api: Breakdown JSON
    and
        Api->>BE: GET /api/v1/dashboard/shipment-volume?days=30
        BE->>DB: GROUP BY day
        DB-->>BE: series
        BE-->>Api: Volume JSON
    end
    Api-->>Browser: Typed responses
    Browser-->>User: Render stats, charts, recent shipments
```

## 2. Creating an Order

Triggered from the `new-order-modal` component or the command palette
(`Cmd+K`).

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as NewOrderModal
    participant Api as lib/api.ts
    participant BE as orders router
    participant Schema as schemas.OrderCreate
    participant DB as SQLite

    User->>UI: Fill customer, items, priority
    UI->>Api: createOrder(payload)
    Api->>BE: POST /api/v1/orders
    BE->>Schema: Pydantic validate body
    Schema-->>BE: OrderCreate
    BE->>DB: INSERT INTO orders ...
    DB-->>BE: new row id
    BE-->>Api: 201 Order JSON
    Api-->>UI: Order
    UI-->>User: Close modal, toast success
    UI->>Api: getOrders() (revalidate list)
```

If validation fails, the backend returns `422 Unprocessable Entity` with a
field-level error list that the UI surfaces via the shared toast/alert
component.

## 3. Updating Shipment Status (WebSocket Broadcast)

The status update path powers real-time tracking on the shipment detail page.

```mermaid
sequenceDiagram
    autonumber
    actor Dispatcher
    participant UI as Shipment Detail Page
    participant Api as lib/api.ts
    participant BE as shipments router
    participant Ws as ws_manager
    participant Subs as Other subscribers
    participant DB as SQLite

    Dispatcher->>UI: Click "Mark In Transit"
    UI->>Api: updateShipmentStatus(id, "in_transit")
    Api->>BE: PATCH /api/v1/shipments/{id}/status?status=in_transit
    BE->>DB: UPDATE shipments SET status=... WHERE id=...
    DB-->>BE: ok
    BE->>Ws: broadcast_status_update(id, payload)
    Ws-->>Subs: send JSON over /ws/shipments/{id}
    BE-->>Api: 200 {"message": "Shipment status updated"}
    Api-->>UI: success
    Subs-->>Subs: Re-render timeline / status badge
```

Subscribers connect to `ws://localhost:8000/ws/shipments/{shipment_id}` via the
`use-shipment-socket` hook. The connection is maintained by
`backend/app/ws/manager.py::ConnectionManager`, which is an in-process registry;
horizontal scaling would require replacing it with Redis pub/sub or similar.

## 4. Low-Stock Alert Lifecycle

Combines a synchronous path (inventory mutation routes) with an asynchronous
background scan.

```mermaid
sequenceDiagram
    autonumber
    participant Loop as inventory_scan_loop<br/>(background thread)
    participant Svc as services.inventory_alerts
    participant DB as SQLite
    participant Bell as Notifications API
    participant UI as Header bell / notifications page

    Note over Loop: Runs every<br/>INVENTORY_SCAN_INTERVAL_HOURS
    Loop->>DB: SELECT inventory_items JOIN facilities
    DB-->>Loop: items[]
    loop For each item
        Loop->>Svc: sync_low_stock_notification(db, item)
        alt item below reorder_point AND no unread notification
            Svc->>DB: INSERT notification (warning/error)
        else item above reorder_point AND unread notifications exist
            Svc->>DB: UPDATE notifications SET read=1
        else no change needed
            Svc-->>Loop: None
        end
    end
    Loop->>DB: commit()

    UI->>Bell: GET /api/v1/notifications/unread-count
    Bell->>DB: SELECT COUNT(*) WHERE read=0
    DB-->>Bell: n
    Bell-->>UI: {unread_count: n}
```

Inventory mutation routes (create/update/adjust) also call
`sync_low_stock_notification` inline so notifications are emitted immediately
without waiting for the next scheduled scan.

## 5. Global Search (Cmd+K)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Menu as command-menu
    participant Api as lib/api.ts
    participant BE as search router
    participant DB as SQLite

    User->>Menu: Press Cmd+K, type query
    Menu->>Api: search(query)
    Api->>BE: GET /api/v1/search?q=...
    BE->>DB: UNION across customers, orders, shipments, inventory, facilities
    DB-->>BE: matched rows
    BE-->>Api: {customers:[], orders:[], shipments:[], ...}
    Api-->>Menu: results
    Menu-->>User: Grouped results with deep-links
```

## 6. Application Startup

```mermaid
sequenceDiagram
    autonumber
    participant PM as pnpm dev
    participant Uvi as uvicorn
    participant App as FastAPI app
    participant DB as SQLite
    participant Thread as inventory_scan_loop

    PM->>Uvi: start uvicorn main:app --reload
    Uvi->>App: import main.py
    App->>DB: Base.metadata.create_all(bind=engine)
    DB-->>App: schema ensured
    App->>App: register routers & CORS middleware
    App->>App: on_event("startup")
    App->>Thread: start background thread (unless pytest or ACME_DISABLE_BACKGROUND_JOBS=1)
    Uvi-->>PM: Listening on :8000
    Note over Thread: waits INVENTORY_SCAN_INITIAL_DELAY_SECONDS<br/>then scans every INVENTORY_SCAN_INTERVAL_HOURS
```

## 7. Error Path: Backend Unreachable

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant Api as lib/api.ts
    participant Logger as lib/logger.ts

    User->>Browser: Trigger data fetch
    Browser->>Api: fetch /api/v1/...
    Api--xApi: network error (connection refused)
    Api->>Logger: logError(err, {endpoint, method})
    Api-->>Browser: throw Error
    Browser-->>User: Render error boundary / toast
    Note over Browser,User: See docs/runbooks/backend-api-outage.md<br/>for operator response
```

---

When adding new user-visible flows, append a section to this document and
cross-link the relevant runbook under `docs/runbooks/` if there are known
operational failure modes.
