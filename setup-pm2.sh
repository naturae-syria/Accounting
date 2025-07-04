#!/bin/bash

# تكوين المتغيرات
APP_NAME="accounting-system"
APP_DIR="/var/www/$APP_NAME"

# التحقق من تثبيت PM2
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing..."
    pnpm add -g pm2
fi

# إنشاء ملف تكوين PM2
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

# تشغيل التطبيق باستخدام PM2
echo "Starting the application with PM2..."
pm2 start ecosystem.config.js

# تكوين PM2 للتشغيل عند بدء النظام
pm2 save
# Use the recommended startup command directly instead of piping output to bash
pm2 startup systemd -u "$(whoami)" --hp "$HOME"

echo "PM2 setup completed successfully!"
