#!/bin/bash

# تكوين المتغيرات
APP_NAME="accounting-system"
APP_DIR="/var/www/$APP_NAME"
GITHUB_REPO="https://github.com/your-github-username/accounting-distribution-system.git"  # قم بتغيير هذا إلى مستودع GitHub الخاص بك
BRANCH="main"

# التحقق من وجود المتطلبات
echo "التحقق من المتطلبات..."
for cmd in git node npm; do
    if ! command -v $cmd &> /dev/null; then
        echo "$cmd غير مثبت. الرجاء تثبيته قبل المتابعة."
        exit 1
    fi
done

# إنشاء مجلد التطبيق إذا لم يكن موجودًا
if [ ! -d "$APP_DIR" ]; then
    echo "إنشاء مجلد التطبيق..."
    sudo mkdir -p "$APP_DIR"
    sudo chown $(whoami):$(whoami) "$APP_DIR"
fi

# استنساخ أو تحديث المستودع
if [ -d "$APP_DIR/.git" ]; then
    echo "تحديث المستودع..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "استنساخ المستودع..."
    git clone -b $BRANCH $GITHUB_REPO "$APP_DIR"
    cd "$APP_DIR"
fi

# تثبيت الاعتماديات
echo "تثبيت الاعتماديات..."
npm ci

# إنشاء ملف .env إذا لم يكن موجودًا
if [ ! -f "$APP_DIR/.env" ]; then
    echo "إنشاء ملف .env..."
    cp .env.example .env
    
    # طلب معلومات قاعدة البيانات
    echo "الرجاء إدخال معلومات قاعدة البيانات:"
    read -p "DB_USER: " db_user
    read -p "DB_HOST: " db_host
    read -p "DB_NAME: " db_name
    read -sp "DB_PASSWORD: " db_password
    echo ""
    read -p "DB_PORT: " db_port
    
    # تحديث ملف .env
    sed -i "s/DB_USER=.*/DB_USER=$db_user/" .env
    sed -i "s/DB_HOST=.*/DB_HOST=$db_host/" .env
    sed -i "s/DB_NAME=.*/DB_NAME=$db_name/" .env
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$db_password/" .env
    sed -i "s/DB_PORT=.*/DB_PORT=$db_port/" .env
fi

# بناء التطبيق
echo "بناء التطبيق..."
npm run build

# تهيئة قاعدة البيانات
echo "هل تريد تهيئة قاعدة البيانات؟ (y/n)"
read init_db
if [ "$init_db" = "y" ]; then
    echo "تهيئة قاعدة البيانات..."
    node -e "require('./lib/db').initializeDatabase().then(() => require('./lib/db').seedDatabase()).then(() => console.log('تم تهيئة قاعدة البيانات بنجاح')).catch(err => console.error('خطأ في تهيئة قاعدة البيانات:', err)).finally(() => process.exit())"
fi

# إعداد PM2 إذا لم يكن موجودًا
if ! command -v pm2 &> /dev/null; then
    echo "تثبيت PM2..."
    npm install -g pm2
fi

# إنشاء ملف تكوين PM2
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: "$APP_NAME",
    script: "npm",
    args: "start",
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
};
EOL

# إعادة تشغيل التطبيق باستخدام PM2
echo "إعادة تشغيل التطبيق..."
pm2 startOrRestart ecosystem.config.js

# تكوين PM2 للتشغيل عند بدء النظام
pm2 save
pm2 startup | grep -v "sudo" | bash

# إعداد Nginx إذا لم يكن موجودًا
if ! command -v nginx &> /dev/null; then
    echo "تثبيت Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# إنشاء ملف تكوين Nginx
echo "إنشاء ملف تكوين Nginx..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOL
server {
    listen 80;
    server_name _;  # قم بتغيير هذا إلى اسم النطاق الخاص بك
    
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

echo "تم نشر التطبيق بنجاح!"
echo "يمكنك الوصول إلى التطبيق على: http://your-server-ip"
echo ""
echo "لإعداد SSL، يمكنك استخدام Let's Encrypt:"
echo "sudo apt-get install -y certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d your-domain.com"
