---
name: dev-environment-fix
description: Diagnose and fix development server issues. Use when pnpm dev fails, after git operations, or when the backend/frontend won't start.
---

# Dev Environment Fix

Troubleshoot and fix common development environment issues.

## Quick Diagnosis

Run this first to identify the problem:

```bash
cd /path/to/logistics-app
pnpm dev:backend 2>&1 | head -50
```

## Common Issues & Solutions

### 1. Missing Python Package

**Error:**
```
ModuleNotFoundError: No module named 'structlog'
```

**Fix:**
```bash
cd backend
.venv/bin/pip install -r requirements.txt
```

Or install specific package:
```bash
.venv/bin/pip install structlog
```

### 2. Python Version Syntax Error

**Error:**
```
TypeError: unsupported operand type(s) for |: 'type' and 'NoneType'
```

**Cause:** Python 3.9 doesn't support `str | None` union syntax.

**Fix:** Add future import and use Optional:
```python
from __future__ import annotations
from typing import Optional

# Change: def func(name: str | None = None)
# To:     def func(name: Optional[str] = None)
```

### 3. Virtual Environment Missing/Corrupted

**Error:**
```
.venv/bin/uvicorn: No such file or directory
```

**Fix:**
```bash
cd backend
rm -rf .venv
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

### 4. Database Issues

**Error:**
```
sqlite3.OperationalError: no such table: orders
```

**Fix:**
```bash
pnpm db:reset
# Or manually:
cd backend
rm -f acme_logistics.db
.venv/bin/python seed.py
```

### 5. Stale Data (Old Timestamps)

**Symptom:** All dates show "42 days ago" or similar old timestamps.

**Fix:** Reseed the database:
```bash
pnpm db:reset
```

If seed script has date issues, check `backend/seed.py` for hardcoded dates vs `datetime.now()`.

### 6. Git Divergence After Pull

**Error:**
```
Your branch and 'origin/main' have diverged
```

**Fix (discard local, sync with remote):**
```bash
git fetch origin
git reset --hard origin/main
```

Then reinstall dependencies:
```bash
pnpm install
cd backend && .venv/bin/pip install -r requirements.txt
```

### 7. Frontend Build Errors

**Error:**
```
Module not found: Can't resolve '@/components/ui/...'
```

**Fix:**
```bash
pnpm install
```

### 8. Port Already in Use

**Error:**
```
Address already in use: 127.0.0.1:8000
```

**Fix:**
```bash
# Find and kill the process
lsof -i :8000
kill -9 <PID>

# Or use a different port
cd backend && .venv/bin/uvicorn main:app --port 8001
```

### 9. Node Modules Issues

**Error:**
```
ENOENT: no such file or directory, open '.../node_modules/...'
```

**Fix:**
```bash
rm -rf node_modules frontend/node_modules
pnpm install
```

## Full Reset Procedure

When nothing else works:

```bash
# 1. Clean everything
rm -rf node_modules frontend/node_modules
rm -rf backend/.venv
rm -f backend/acme_logistics.db

# 2. Reinstall
pnpm install
cd backend && python3 -m venv .venv
cd backend && .venv/bin/pip install -r requirements.txt

# 3. Seed database
pnpm db:reset

# 4. Start dev server
pnpm dev
```

## Verification

After fixing, verify:

```bash
# Backend starts
pnpm dev:backend
# Should see: "Application startup complete"

# Frontend starts
pnpm dev:frontend
# Should see: "Ready in Xs"

# Both together
pnpm dev
# Visit http://localhost:3000
```

## Diagnostic Commands

```bash
# Check Python version
python3 --version

# Check venv packages
cd backend && .venv/bin/pip list

# Check Node version
node --version

# Check pnpm version
pnpm --version

# Git status
git status

# Database exists and has data
sqlite3 backend/acme_logistics.db "SELECT COUNT(*) FROM orders;"
```
