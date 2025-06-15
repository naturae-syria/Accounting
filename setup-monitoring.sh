#!/bin/bash

set -e

# تثبيت Prometheus
echo "Installing Prometheus..."
sudo apt-get update
sudo apt-get install -y prometheus


# تكوين Prometheus
sudo tee /etc/prometheus/prometheus.yml > /dev/null << EOL
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'accounting-system'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['localhost:3000']
EOL

# تشغيل الخدمات
sudo systemctl enable prometheus
sudo systemctl start prometheus

echo "Prometheus set up successfully!"
