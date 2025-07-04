#!/bin/bash

# تكوين المتغيرات
APP_NAME="accounting-system"
# اسم النطاق اختياري. الافتراضي هو localhost ويمكن تعديله لاحقًا
DOMAIN=${DOMAIN:-localhost}
USE_SSL=${USE_SSL:-false}

# السماح بتحديد نطاق مخصص عند التشغيل
# Read domain name and sanitize input to avoid invalid characters
read -p "Enter the domain name (default: $DOMAIN): " DOMAIN_INPUT
DOMAIN=${DOMAIN_INPUT:-$DOMAIN}
# Allow letters, numbers, dashes and dots only
if [[ ! $DOMAIN =~ ^[A-Za-z0-9.-]+$ ]]; then
    echo "Invalid domain name: $DOMAIN" >&2
    exit 1
fi

# التحقق من تثبيت Nginx
if ! command -v nginx &> /dev/null; then
    echo "Nginx is not installed. Installing..."
    sudo apt-get update
    if ! sudo apt-get install -y nginx; then
        echo "Failed to install Nginx. Check your network connection." >&2
        exit 1
    fi
fi

# إنشاء ملف تكوين Nginx
echo "Creating Nginx configuration file..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOL
server {
    # Handle requests on port 80 for any host by default
    listen 80 default_server;
    server_name $DOMAIN _;
    
    location / {
        # Use an explicit IPv4 address to avoid issues when IPv6 is enabled
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    
    # تكوين ضغط Gzip
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
      application/javascript
      application/json
      application/x-javascript
      text/css
      text/javascript
      text/plain
      text/xml;
    
    # تخزين مؤقت للملفات الثابتة
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOL

# تفعيل موقع Nginx
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# إعداد SSL إذا كان مطلوبًا
if [ "$USE_SSL" = "true" ]; then
    echo "Setting up SSL using Let's Encrypt..."
    
    # التحقق من تثبيت Certbot
    if ! command -v certbot &> /dev/null; then
        echo "Certbot is not installed. Installing..."
        sudo apt-get update
        if ! sudo apt-get install -y certbot python3-certbot-nginx; then
            echo "Failed to install Certbot." >&2
            exit 1
        fi
    fi
    
    # الحصول على شهادة SSL
    sudo certbot --nginx -d $DOMAIN
fi

echo "Nginx setup completed successfully!"
