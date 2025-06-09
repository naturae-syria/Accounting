#!/bin/bash

# Ensure UFW is installed
if ! command -v ufw &> /dev/null; then
    echo "UFW is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y ufw
fi

# Allow essential ports for the accounting system
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000

# Enable the firewall if not already enabled
STATUS=$(sudo ufw status | head -n1)
if [[ "$STATUS" == "Status: inactive" ]]; then
    sudo ufw --force enable
fi

sudo ufw status verbose

echo "Firewall configured successfully!"
