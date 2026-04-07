#!/bin/bash
# Check if backend dependencies match requirements.txt

set -e

BACKEND_DIR="${1:-backend}"

if [ ! -d "$BACKEND_DIR/.venv" ]; then
    echo "ERROR: Virtual environment not found at $BACKEND_DIR/.venv"
    echo "Run: cd $BACKEND_DIR && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
    exit 1
fi

echo "Checking Python dependencies..."

# Get installed packages
INSTALLED=$("$BACKEND_DIR/.venv/bin/pip" freeze 2>/dev/null | cut -d= -f1 | tr '[:upper:]' '[:lower:]' | sort)

# Get required packages (strip version specifiers)
REQUIRED=$(cat "$BACKEND_DIR/requirements.txt" | grep -v "^#" | grep -v "^$" | cut -d= -f1 | cut -d'>' -f1 | cut -d'<' -f1 | tr '[:upper:]' '[:lower:]' | sort)

# Find missing packages
MISSING=""
for pkg in $REQUIRED; do
    if ! echo "$INSTALLED" | grep -q "^${pkg}$"; then
        MISSING="$MISSING $pkg"
    fi
done

if [ -n "$MISSING" ]; then
    echo "Missing packages:$MISSING"
    echo ""
    echo "Run: cd $BACKEND_DIR && .venv/bin/pip install -r requirements.txt"
    exit 1
else
    echo "All required packages are installed."
fi

# Check Python version compatibility
PYTHON_VERSION=$("$BACKEND_DIR/.venv/bin/python" --version 2>&1 | cut -d' ' -f2)
MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)

echo "Python version: $PYTHON_VERSION"

if [ "$MAJOR" -eq 3 ] && [ "$MINOR" -lt 10 ]; then
    echo "WARNING: Python $PYTHON_VERSION may have compatibility issues with modern type hints."
    echo "Consider using 'from __future__ import annotations' in Python files."
fi

echo ""
echo "Dependency check passed."
