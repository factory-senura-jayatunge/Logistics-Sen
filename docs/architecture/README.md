# Architecture Documentation

This directory contains architecture diagrams, service dependency documentation, and
request flow diagrams for the Acme Logistics platform.

All diagrams are authored in [Mermaid](https://mermaid.js.org/) so they render
natively on GitHub, in the Factory wiki, and inside most Markdown viewers.

## Contents

| Document | Purpose |
|----------|---------|
| [System Overview](./system-overview.md) | High-level component diagram, deployment topology, and technology stack |
| [Service Dependencies](./service-dependencies.md) | Inventory of external services, APIs, databases, and internal package dependencies |
| [Data Model](./data-model.md) | Entity-relationship diagram and persistence layer documentation |
| [Request Flows](./request-flows.md) | Sequence diagrams for critical user and system flows |

## How to Update

1. Edit the relevant `.md` file under `docs/architecture/`.
2. Preview Mermaid rendering locally with the
   [Mermaid Live Editor](https://mermaid.live/) or the GitHub Markdown preview.
3. Keep diagrams in sync with the code under `backend/app/` and `frontend/` when
   adding new routes, models, or external dependencies.
4. When a new external integration is added (for example a third-party API), add
   it to [Service Dependencies](./service-dependencies.md) in the same PR.

## Conventions

- Backend components live under `backend/app/` and are grouped by responsibility
  (`api/`, `db/`, `models/`, `schemas/`, `services/`, `ws/`).
- Frontend components live under `frontend/app/` (routes) and `frontend/components/`
  (UI). API calls go through the typed client at `frontend/lib/api.ts`.
- Diagrams use the following color/shape semantics:
  - Rectangles: internal application components.
  - Cylinders: data stores.
  - Clouds: external systems.
  - Dashed lines: asynchronous or background communication.
