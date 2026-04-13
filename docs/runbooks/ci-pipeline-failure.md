# Runbook: CI Pipeline Failure

**Severity**: Medium
**Services affected**: Development workflow, merge ability
**On-call**: Whoever opened the PR

## Symptoms

- GitHub Actions CI workflow reports a failed check on a pull request
- The "CI" status check is red on the PR page
- Build, lint, test, or format steps fail

## Diagnosis Steps

### 1. Identify which job and step failed

Open the GitHub Actions run from the PR checks. The CI workflow (`.github/workflows/ci.yml`) has two jobs:

- **Frontend** — lint, format check, type check, tests, build
- **Backend** — ruff lint, black format check, seed database, pytest

Note which **step** within the job failed.

### 2. Reproduce locally

#### Frontend failures

```bash
# Lint
pnpm lint

# Format check
(cd frontend && pnpm format:check)

# Type check
(cd frontend && pnpm exec tsc --noEmit)

# Tests
pnpm test:frontend

# Build
pnpm build
```

#### Backend failures

```bash
cd backend

# Lint (matches CI command)
.venv/bin/ruff check . --ignore I001

# Format check
.venv/bin/black --check .

# Seed database (required before tests)
.venv/bin/python seed.py

# Tests
.venv/bin/pytest -v
```

### 3. Common failure patterns

| CI Step | Common Cause | Quick Fix |
|---------|-------------|-----------|
| Frontend Lint | ESLint rule violation | `pnpm lint --fix` in `frontend/` |
| Frontend Format | Prettier formatting mismatch | `pnpm format` in project root |
| Frontend Type Check | TypeScript error | Fix the type error reported by `tsc` |
| Frontend Tests | Failing Vitest test | Run `pnpm test:frontend` locally, fix test or code |
| Frontend Build | Build-time error | See [Frontend Deployment Failure](./frontend-deployment-failure.md) |
| Backend Lint | Ruff rule violation | `ruff check --fix .` in `backend/` |
| Backend Format | Black formatting | `black .` in `backend/` |
| Backend Seed | seed.py error | Check for model/schema changes breaking seed data |
| Backend Tests | Pytest failure | Run `pytest -v` locally, examine failure output |

## Resolution

### Auto-fix lint and format issues

```bash
# Frontend
(cd frontend && pnpm lint --fix)
(cd frontend && pnpm exec prettier --write .)

# Backend
(cd backend && .venv/bin/ruff check --fix .)
(cd backend && .venv/bin/black .)
```

Commit the fixes and push to the PR branch.

### Fix failing tests

1. Run the failing test suite locally with verbose output
2. Read the assertion error or traceback
3. Fix the application code or update the test if the expected behavior changed
4. Re-run the full test suite to confirm no regressions:
   ```bash
   pnpm test
   ```

### Fix seed script failures

If `seed.py` fails, it usually means the data models changed without updating the seed script:

```bash
cd backend
# Check what changed in models
git diff main -- app/models/models.py

# Update seed.py to match new model fields
# Then test:
rm -f acme_logistics.db
.venv/bin/python seed.py
```

## Verification

1. All checks pass locally:
   ```bash
   pnpm lint && pnpm build && pnpm test
   ```
2. Push the fix and confirm the CI workflow passes on GitHub

## Prevention

- Use `lint-staged` + Husky pre-commit hooks (already configured in `package.json`) to catch lint/format issues before commit
- Run `pnpm test` locally before pushing
- Keep `seed.py` in sync when modifying data models
