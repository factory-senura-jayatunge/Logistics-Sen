# Runbook: Backend API Outage

**Severity**: Critical
**Services affected**: Backend (FastAPI), all frontend data-dependent pages
**On-call**: Backend team

## Symptoms

- Frontend shows loading spinners indefinitely or network errors
- `GET http://localhost:8000/health` returns non-200 or times out
- Structured logs stop appearing in stdout

## Diagnosis Steps

### 1. Check if the backend process is running

```bash
# Check if uvicorn is listening on port 8000
lsof -i :8000
# or
ps aux | grep uvicorn
```

If the process is not running, proceed to **Resolution > Restart the backend**.

### 2. Check the health endpoint

```bash
curl -s http://localhost:8000/health
# Expected: {"status": "healthy"}
```

If the endpoint returns an error, check application logs for stack traces.

### 3. Check application logs

The backend uses structured logging via `structlog`. Look for error-level events:

```bash
# If running in foreground, check terminal output
# Look for log entries with "level": "error" or Python tracebacks
```

Common error patterns:
- `sqlalchemy.exc.OperationalError` — Database file missing or corrupted (see [Database Issues](./database-issues.md))
- `ModuleNotFoundError` — Missing Python dependency
- `Address already in use` — Port 8000 occupied by another process

### 4. Check port conflicts

```bash
lsof -i :8000
# If another process holds the port, kill it or change the backend port
kill -9 <PID>
```

### 5. Verify database connectivity

```bash
cd backend
python3 -c "from app.db.database import engine; engine.connect(); print('DB OK')"
```

## Resolution

### Restart the backend

```bash
# From project root
pnpm dev:backend

# Or directly
cd backend && .venv/bin/uvicorn main:app --reload --port 8000
```

### Reinstall dependencies (if ModuleNotFoundError)

```bash
cd backend
.venv/bin/pip install -r requirements.txt
```

### Recreate virtual environment (if venv is corrupted)

```bash
cd backend
rm -rf .venv
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

### Reset the database (if DB-related)

```bash
pnpm db:reset
```

## Verification

1. Confirm health endpoint returns 200:
   ```bash
   curl -s http://localhost:8000/health
   ```
2. Confirm the dashboard loads data:
   ```bash
   curl -s http://localhost:8000/api/v1/dashboard/stats | head -c 200
   ```
3. Open `http://localhost:3000/dashboard` and verify data renders

## Prevention

- Monitor the `/health` endpoint with an uptime check
- Set up process supervision (systemd, Docker restart policies) so the backend auto-restarts on crash
- Pin Python dependency versions in `requirements.txt` to avoid surprise breakage
