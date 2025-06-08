#!/bin/bash

# التحقق من تثبيت Redis
if ! command -v redis-server &> /dev/null; then
    echo "Redis is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y redis-server
fi

# تكوين Redis للتشغيل عند بدء النظام
sudo systemctl enable redis-server
sudo systemctl start redis-server

# التحقق من حالة Redis
sudo systemctl status redis-server

echo "Redis setup completed successfully!"
