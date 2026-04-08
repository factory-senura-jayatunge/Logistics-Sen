# Runbook: Database Issues

**Severity**: High
**Services affected**: Backend API (all data endpoints)
**On-call**: Backend team

## Symptoms

- API returns 500 errors on data-fetching endpoints
- Logs contain `sqlalchemy.exc.OperationalError` or `sqlite3.OperationalError`
- Error messages mentioning "database is locked", "disk I/O error", or "no such table"

## Diagnosis Steps

### 1. Verify the database file exists

```bash
ls -la backend/acme_logistics.db
```

If the file is missing, proceed to **Resolution > Reseed the database**.

### 2. Check database file integrity

```bash
(cd backend && sqlite3 acme_logistics.db "PRAGMA integrity_check;")
# Expected output: "ok"
```

If integrity check fails, the database is corrupted. Proceed to **Resolution > Reset the database**.

### 3. Check for lock contention

SQLite uses file-level locking. Concurrent writes can cause "database is locked" errors.

```bash
# Check if multiple processes are accessing the DB file
fuser backend/acme_logistics.db
```

If multiple processes hold the file, stop extra processes or wait for them to finish.

### 4. Verify schema is up to date

```bash
(cd backend && sqlite3 acme_logistics.db ".tables")
# Expected tables: customers, facilities, orders, shipments,
#   inventory_items, vehicles, users, notifications
```

If tables are missing, the schema may not have been created. The backend auto-creates tables on startup via `Base.metadata.create_all(bind=engine)` in `main.py`.

### 5. Check disk space

```bash
df -h .
```

SQLite operations fail silently when disk is full.

## Resolution

### Reseed the database (data missing)

```bash
pnpm seed
# This runs: cd backend && .venv/bin/python seed.py
```

### Reset the database (corruption or schema mismatch)

```bash
pnpm db:reset
# This runs: cd backend && rm -f acme_logistics.db && .venv/bin/python seed.py
```

### Fix "database is locked" errors

1. Stop all backend processes:
   ```bash
   pkill -f "uvicorn main:app"
   ```
2. Verify no processes hold the file:
   ```bash
   fuser backend/acme_logistics.db
   ```
3. Restart the backend:
   ```bash
   pnpm dev:backend
   ```

### Fix file permission issues

```bash
chmod 644 backend/acme_logistics.db
# Ensure the backend process user owns the file
```

## Verification

1. Run integrity check:
   ```bash
   (cd backend && sqlite3 acme_logistics.db "PRAGMA integrity_check;")
   ```
2. Confirm data is present:
   ```bash
   (cd backend && sqlite3 acme_logistics.db "SELECT COUNT(*) FROM orders;")
   ```
3. Confirm API returns data:
   ```bash
   curl -s http://localhost:8000/api/v1/dashboard/stats | head -c 200
   ```

## Prevention

- Back up `acme_logistics.db` before running destructive operations
- Avoid running multiple backend instances against the same SQLite file
- Consider migrating to PostgreSQL for production deployments with concurrent access needs
- The `connect_args={"check_same_thread": False}` setting in `database.py` allows multi-threaded access but does not prevent lock contention under heavy write load
