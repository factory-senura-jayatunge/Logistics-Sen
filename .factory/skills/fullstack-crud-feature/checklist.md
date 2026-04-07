# Fullstack CRUD Feature Checklist

## Backend

- [ ] SQLAlchemy model added to `models/models.py`
- [ ] Model uses `mapped_column` syntax (SQLAlchemy 2.0)
- [ ] Timestamps: `created_at` and `updated_at` fields
- [ ] Pydantic schemas in `schemas/schemas.py` (Base, Create, Response)
- [ ] Schemas use `from_attributes = True` in Config
- [ ] FastAPI router created in `api/v1/routes/`
- [ ] Router registered in `main.py`
- [ ] All endpoints have `response_model` defined
- [ ] 404 errors raised for missing resources
- [ ] Ruff passes: `cd backend && .venv/bin/ruff check .`
- [ ] Tests pass: `pnpm test:backend`

## Frontend

- [ ] TypeScript interfaces added to `lib/api.ts`
- [ ] API functions (get, getOne, create, update, delete) added
- [ ] Status colors added to `lib/utils.ts` (if applicable)
- [ ] List page created at `app/<resource>/page.tsx`
- [ ] Detail page created at `app/<resource>/[id]/page.tsx`
- [ ] Navigation added to sidebar
- [ ] ESLint passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Tests pass: `pnpm test:frontend`

## Integration

- [ ] Dev server starts without errors: `pnpm dev`
- [ ] List page loads and displays data
- [ ] Detail page loads for individual items
- [ ] Create form works (if implemented)
- [ ] Status badges use theme colors (not hardcoded)
