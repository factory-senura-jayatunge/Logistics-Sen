#!/usr/bin/env bash
#
# Validates that AGENTS.md stays consistent with the actual codebase.
# Run from the repository root.
#
set -euo pipefail

ERRORS=0
WARNINGS=0

error() { echo "ERROR: $1"; ((ERRORS++)); }
warn()  { echo "WARNING: $1"; ((WARNINGS++)); }
info()  { echo "OK: $1"; }

AGENTS_MD="AGENTS.md"

if [[ ! -f "$AGENTS_MD" ]]; then
  echo "FATAL: $AGENTS_MD not found. Run this script from the repo root."
  exit 1
fi

# ---------------------------------------------------------------------------
# 1. Validate documented pnpm commands exist in package.json
# ---------------------------------------------------------------------------
echo ""
echo "=== Checking documented pnpm commands ==="

DOCUMENTED_CMDS=$(grep -oP 'pnpm \K[a-z:_-]+' "$AGENTS_MD" | sort -u)
PKG_SCRIPTS=$(python3 -c "
import json, sys
with open('package.json') as f:
    scripts = json.load(f).get('scripts', {})
for s in sorted(scripts):
    print(s)
")

for cmd in $DOCUMENTED_CMDS; do
  if echo "$PKG_SCRIPTS" | grep -qx "$cmd"; then
    info "pnpm $cmd exists in package.json"
  else
    # Some commands like 'install' are built-in pnpm commands
    case "$cmd" in
      install|exec|run) info "pnpm $cmd is a built-in command" ;;
      *) error "pnpm $cmd is documented in AGENTS.md but missing from package.json scripts" ;;
    esac
  fi
done

# ---------------------------------------------------------------------------
# 2. Validate documented directories exist
# ---------------------------------------------------------------------------
echo ""
echo "=== Checking documented directory structure ==="

DIRS=(
  "frontend/app"
  "frontend/components"
  "frontend/components/ui"
  "frontend/lib"
  "frontend/hooks"
  "backend/app"
  "backend/app/api/v1/routes"
  "backend/app/db"
  "backend/app/models"
  "backend/app/schemas"
  "backend/tests"
  ".github/workflows"
)

for dir in "${DIRS[@]}"; do
  if [[ -d "$dir" ]]; then
    info "Directory $dir exists"
  else
    error "Directory $dir is documented in AGENTS.md but does not exist"
  fi
done

# ---------------------------------------------------------------------------
# 3. Validate documented key files exist
# ---------------------------------------------------------------------------
echo ""
echo "=== Checking documented key files ==="

FILES=(
  "frontend/lib/api.ts"
  "frontend/lib/utils.ts"
  "frontend/lib/locations.ts"
  "backend/main.py"
  "backend/seed.py"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    info "File $file exists"
  else
    error "File $file is documented in AGENTS.md but does not exist"
  fi
done

# ---------------------------------------------------------------------------
# 4. Validate documented API routes have corresponding route files
# ---------------------------------------------------------------------------
echo ""
echo "=== Checking documented API route modules ==="

DOCUMENTED_ROUTES=$(grep -oP -- '- `/\w+' "$AGENTS_MD" | sed 's/- `\///' | sort -u)
ROUTE_DIR="backend/app/api/v1/routes"

for route in $DOCUMENTED_ROUTES; do
  route_file="$ROUTE_DIR/${route}.py"
  if [[ -f "$route_file" ]]; then
    info "Route module $route_file exists for /$route endpoint"
  else
    # dashboard routes may use dashboard.py for /dashboard/*
    base_route="${route%%/*}"
    alt_file="$ROUTE_DIR/${base_route}.py"
    if [[ -f "$alt_file" ]]; then
      info "Route module $alt_file exists for /$route endpoint"
    else
      error "No route module found for documented endpoint /$route (expected $route_file)"
    fi
  fi
done

# ---------------------------------------------------------------------------
# 5. Validate documented ORM model classes exist in models.py
# ---------------------------------------------------------------------------
echo ""
echo "=== Checking documented data models ==="

MODELS_FILE="backend/app/models/models.py"
if [[ ! -f "$MODELS_FILE" ]]; then
  error "Models file $MODELS_FILE does not exist"
else
  DOCUMENTED_MODELS=$(sed -n '/^## Data Models/,/^## /p' "$AGENTS_MD" | grep -oP '^\| (\w+)\s+\|' | sed 's/| //;s/ |//' | grep -v '^Model$' | sort -u)
  for model in $DOCUMENTED_MODELS; do
    if grep -qP "class ${model}\b" "$MODELS_FILE"; then
      info "Model class $model found in $MODELS_FILE"
    else
      error "Model class $model is documented in AGENTS.md but not found in $MODELS_FILE"
    fi
  done
fi

# ---------------------------------------------------------------------------
# 6. Validate API endpoint prefix is correct
# ---------------------------------------------------------------------------
echo ""
echo "=== Checking API prefix consistency ==="

MAIN_FILE="backend/main.py"
if [[ -f "$MAIN_FILE" ]]; then
  if grep -q '/api/v1' "$MAIN_FILE"; then
    info "API prefix /api/v1 found in $MAIN_FILE"
  else
    warn "API prefix /api/v1 not found in $MAIN_FILE — AGENTS.md may be outdated"
  fi
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
echo "========================================="
echo "Validation complete: $ERRORS error(s), $WARNINGS warning(s)"
echo "========================================="

if [[ $ERRORS -gt 0 ]]; then
  echo ""
  echo "AGENTS.md is out of sync with the codebase. Please update it."
  exit 1
fi

if [[ $WARNINGS -gt 0 ]]; then
  echo ""
  echo "AGENTS.md has potential inconsistencies. Consider reviewing."
fi

exit 0
