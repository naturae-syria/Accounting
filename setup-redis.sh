#!/bin/bash

# Ensure Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "Redis is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y redis-server
fi

# Configure Redis to start on boot
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Check Redis status
sudo systemctl status redis-server

echo "Redis setup complete!"
