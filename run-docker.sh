#!/bin/bash

# Make the init-db script executable
chmod +x init-db.sh

# Build and start the containers
docker-compose up -d

# Wait for the database service to be ready
echo "Waiting for the database to be ready..."
until docker-compose exec db pg_isready >/dev/null 2>&1; do
  echo "Database not ready yet... waiting 2 seconds"
  sleep 2
done

# Initialize the database
docker-compose exec app ./init-db.sh

echo "Application started successfully!"
echo "You can access the app at: http://localhost:3000"
