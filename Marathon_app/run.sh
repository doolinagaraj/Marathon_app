#!/usr/bin/env bash
set -euo pipefail

# Run backend and frontend together using docker-compose
# Usage: ./run.sh

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

REBUILD=false
ARG="${1:-}"
if [ "$ARG" = "rebuild" ] || [ "$ARG" = "build" ]; then
	REBUILD=true
fi

# Prefer Docker Compose v2 plugin (`docker compose`) when available
if docker compose version >/dev/null 2>&1; then
	COMPOSE_CMD="docker compose"
else
	COMPOSE_CMD="docker-compose"
fi

if [ "$REBUILD" = true ]; then
	echo "Building and starting backend + frontend..."
    $COMPOSE_CMD up -d --build backend frontend
else
	echo "Starting backend + frontend (no rebuild)..."
	$COMPOSE_CMD up -d backend frontend
fi

echo "Following backend logs (ctrl-c to stop tail)..."
$COMPOSE_CMD logs -f backend
