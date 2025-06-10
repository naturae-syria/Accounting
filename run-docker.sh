#!/bin/bash

# Make the init-db script executable
chmod +x init-db.sh

# Determine which docker compose command is available
if command -v docker-compose >/dev/null 2>&1; then
  compose_cmd="docker-compose"
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  compose_cmd="docker compose"
else
  echo "Error: docker-compose or docker compose is required but not installed." >&2
  exit 1
fi

# Load environment variables from .env if present
if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a && . ./.env && set +a
fi

# Determine host port for PostgreSQL (fall back to 5432)
db_port_host="${DB_PORT_HOST:-5432}"

# If lsof is available, verify the port is free
if command -v lsof >/dev/null 2>&1; then
  if lsof -i -P -n | grep -q ":${db_port_host}\s"; then
    new_port=$db_port_host
    # Find the next available port
    while lsof -i -P -n | grep -q ":${new_port}\s"; do
      new_port=$((new_port + 1))
    done
    echo "Port ${db_port_host} is in use, switching to ${new_port}"
    if [ -w .env ]; then
      sed -i.bak "s/^DB_PORT_HOST=.*/DB_PORT_HOST=${new_port}/" .env && rm -f .env.bak
    fi
    db_port_host=$new_port
    export DB_PORT_HOST=$new_port
  fi
fi

# Build and start the containers
$compose_cmd up -d

# Wait for the database service to be ready
echo "Waiting for the database to be ready..."
until $compose_cmd exec db pg_isready >/dev/null 2>&1; do
  echo "Database not ready yet... waiting 2 seconds"
  sleep 2
done

# Initialize the database
$compose_cmd exec app ./init-db.sh

echo "Application started successfully!"
echo "You can access the app at: http://localhost:3000"
