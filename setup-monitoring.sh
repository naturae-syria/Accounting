#!/bin/bash

# تثبيت Prometheus
echo "تثبيت Prometheus..."
sudo apt-get update
sudo apt-get install -y prometheus

# تثبيت Grafana
echo "تثبيت Grafana..."
sudo apt-get install -y apt-transport-https software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
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

echo "تم إعداد Prometheus و Grafana بنجاح!"
echo "يمكنك الوصول إلى Grafana على: http://your-server-ip:3000"
echo "اسم المستخدم الافتراضي: admin"
echo "كلمة المرور الافتراضية: admin"
