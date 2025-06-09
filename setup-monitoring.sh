#!/bin/bash

# تثبيت Prometheus
echo "Installing Prometheus..."
sudo apt-get update
sudo apt-get install -y prometheus

# تثبيت Grafana
echo "Installing Grafana..."
sudo apt-get install -y apt-transport-https software-properties-common wget gpg

# Import Grafana GPG key using the modern keyring location
sudo mkdir -p /etc/apt/keyrings
wget -q -O- https://packages.grafana.com/gpg.key | \
  sudo gpg --dearmor -o /etc/apt/keyrings/grafana.gpg

# Add the Grafana repository using the signed-by option
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://packages.grafana.com/oss/deb stable main" | \
  sudo tee /etc/apt/sources.list.d/grafana.list

sudo apt-get update
sudo apt-get install -y grafana

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
sudo systemctl enable grafana-server
sudo systemctl start grafana-server

echo "Prometheus and Grafana set up successfully!"
echo "You can access Grafana at: http://your-server-ip:3000"
echo "Default username: admin"
echo "Default password: admin"
