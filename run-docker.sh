#!/bin/bash

# Make the init-db script executable
chmod +x init-db.sh

# Build and start the containers
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Initialize the database
docker-compose exec app ./init-db.sh

echo "Application started successfully!"
echo "You can access the app at: http://localhost:3000"
