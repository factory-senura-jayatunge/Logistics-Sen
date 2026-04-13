# Runbook: High API Latency

**Severity**: Medium
**Services affected**: Backend API, frontend user experience
**On-call**: Backend team

## Symptoms

- Frontend pages take noticeably long to load (> 2-3 seconds)
- API responses exceed 500ms for simple queries
- Structured logs show high `duration_ms` values in `http_request` events
- Browser network tab shows slow TTFB (Time to First Byte) for API calls

## Diagnosis Steps

### 1. Identify slow endpoints from logs

The backend logs every request with timing via the `log_requests` middleware in `main.py`. Check for high `duration_ms` values:

```bash
# Look for requests taking more than 500ms in log output
# Structured log fields: method, path, status_code, duration_ms
```

### 2. Test specific endpoints

```bash
# Dashboard stats (aggregates across multiple tables)
time curl -s http://localhost:8000/api/v1/dashboard/stats > /dev/null

# Orders list (may be large)
time curl -s "http://localhost:8000/api/v1/orders?skip=0&limit=10" > /dev/null

# Search (queries multiple tables)
time curl -s "http://localhost:8000/api/v1/search?q=test" > /dev/null
```

### 3. Check database query performance

```bash
cd backend
sqlite3 acme_logistics.db
# Check table sizes
SELECT 'orders' as tbl, COUNT(*) FROM orders
UNION SELECT 'shipments', COUNT(*) FROM shipments
UNION SELECT 'customers', COUNT(*) FROM customers;

# Check if indices exist
.indices
```

### 4. Check system resources

```bash
# CPU and memory usage
top -bn1 | head -20

# Disk I/O (SQLite is I/O-bound)
iostat -x 1 3
```

### 5. Check for N+1 query patterns

Review route handlers in `backend/app/api/v1/routes/` for patterns where a loop issues individual queries instead of using joins or eager loading. SQLAlchemy relationship loading can cause N+1 queries if not using `joinedload()` or `selectinload()`.

## Resolution

### Add database indices

```bash
cd backend
sqlite3 acme_logistics.db
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_facility_id ON inventory_items(facility_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_facility_id ON vehicles(facility_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
```

### Optimize query pagination

Ensure all list endpoints use `skip` and `limit` parameters to avoid loading entire tables:

```python
# Correct pattern (already used in routes):
db.query(Model).offset(skip).limit(limit).all()
```

### Reduce response payload size

If responses include large nested objects, consider adding query parameters to control included fields or relationships.

### Restart the backend (if memory leak suspected)

```bash
pkill -f "uvicorn main:app"
pnpm dev:backend
```

## Verification

1. Re-test the slow endpoint and confirm latency is within acceptable range (< 500ms):
   ```bash
   time curl -s http://localhost:8000/api/v1/dashboard/stats > /dev/null
   ```
2. Check structured logs for improved `duration_ms` values
3. Verify frontend pages load within 2 seconds

## Prevention

- Monitor `duration_ms` from structured logs to catch latency regressions
- Set up alerts for p95 latency exceeding thresholds
- Use SQLAlchemy eager loading (`joinedload`, `selectinload`) for relationship-heavy endpoints
- Run `EXPLAIN QUERY PLAN` on slow queries to ensure index usage
