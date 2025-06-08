#!/bin/bash

# تكوين المتغيرات
APP_NAME="accounting-system"
# اسم النطاق اختياري. الافتراضي هو localhost ويمكن تعديله لاحقًا
DOMAIN=${DOMAIN:-localhost}
USE_SSL=${USE_SSL:-false}

# السماح بتحديد نطاق مخصص عند التشغيل
read -p "أدخل اسم النطاق (الافتراضي: $DOMAIN): " DOMAIN_INPUT
DOMAIN=${DOMAIN_INPUT:-$DOMAIN}

# التحقق من تثبيت Nginx
if ! command -v nginx &> /dev/null; then
    echo "Nginx غير مثبت. جاري التثبيت..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# إنشاء ملف تكوين Nginx
echo "إنشاء ملف تكوين Nginx..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOL
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
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
    echo "إعداد SSL باستخدام Let's Encrypt..."
    
    # التحقق من تثبيت Certbot
    if ! command -v certbot &> /dev/null; then
        echo "Certbot غير مثبت. جاري التثبيت..."
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # الحصول على شهادة SSL
    sudo certbot --nginx -d $DOMAIN
fi

echo "تم إعداد Nginx بنجاح!"
