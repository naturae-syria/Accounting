#!/bin/bash

# Variable configuration
APP_NAME="accounting-system"
APP_DIR="/var/www/$APP_NAME"

# Ensure PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing..."
    pnpm add -g pm2
fi

# Create PM2 configuration file
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: "$APP_NAME",
    script: "pnpm",
    args: "start",
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      DB_USER: process.env.DB_USER,
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_PORT: process.env.DB_PORT,
      REDIS_URL: "redis://localhost:6379"
    }
  }]
};
EOL

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js

# Configure PM2 to run on system startup
pm2 save
pm2 startup | grep -v "sudo" | bash

echo "PM2 setup complete!"
