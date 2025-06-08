#!/bin/bash

# Install Prometheus
echo "Installing Prometheus..."
sudo apt-get update
sudo apt-get install -y prometheus

# Install Grafana
echo "Installing Grafana..."
sudo apt-get install -y apt-transport-https software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y grafana

# Configure Prometheus
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

# Start services
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl enable grafana-server
sudo systemctl start grafana-server

echo "Prometheus and Grafana setup complete!"
echo "Access Grafana at: http://your-server-ip:3000"
echo "Default username: admin"
echo "Default password: admin"
