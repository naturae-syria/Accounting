#!/bin/bash

set -e

# تثبيت Prometheus
echo "Installing Prometheus..."
sudo apt-get update
sudo apt-get install -y prometheus

# تأكد من وجود مساحة قرص كافية قبل تثبيت Grafana
AVAILABLE_SPACE_MB=$(df --output=avail / | tail -n1)
AVAILABLE_SPACE_MB=$((AVAILABLE_SPACE_MB/1024))
if [ "$AVAILABLE_SPACE_MB" -lt 700 ]; then
  echo "Low disk space ($AVAILABLE_SPACE_MB MB available). Cleaning apt cache..."
  sudo apt-get clean
  sudo rm -rf /var/lib/apt/lists/*
  # Recreate apt lists to avoid "package has no installation candidate" errors
  sudo apt-get update
fi

# تثبيت Grafana
echo "Installing Grafana..."
sudo apt-get install -y apt-transport-https software-properties-common wget gpg

# Import Grafana GPG key using a system keyring if missing
GRAFANA_KEYRING=/usr/share/keyrings/grafana-archive-keyring.gpg
if [ ! -f "$GRAFANA_KEYRING" ]; then
  echo "Adding Grafana GPG key..."
  sudo mkdir -p /usr/share/keyrings
  wget -qO- https://packages.grafana.com/gpg.key | \
    sudo gpg --dearmor | sudo tee "$GRAFANA_KEYRING" > /dev/null
fi

# Add the Grafana repository and reference the keyring
echo "deb [signed-by=${GRAFANA_KEYRING}] https://packages.grafana.com/oss/deb stable main" | \
  sudo tee /etc/apt/sources.list.d/grafana.list

sudo apt-get update
if ! sudo apt-get install -y grafana; then
  echo "Failed to install Grafana. Please check your network connection and repository configuration." >&2
  exit 1
fi
sudo apt-get clean

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
echo "For security, log in to Grafana and change the admin password immediately."
