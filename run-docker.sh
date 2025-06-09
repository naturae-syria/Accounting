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
