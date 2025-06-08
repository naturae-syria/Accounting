#!/bin/bash

# Grant execute permission for the database init script
chmod +x init-db.sh

# Build and start containers
docker-compose up -d

# Wait until services are ready
echo "Waiting for services to be ready..."
sleep 10

# Initialize the database
docker-compose exec app ./init-db.sh

echo "Application started successfully!"
echo "You can access the app at: http://localhost:3000"
