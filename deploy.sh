#!/bin/bash

# تكوين المتغيرات
APP_NAME="accounting-system"
APP_DIR="/var/www/$APP_NAME"
GITHUB_REPO="https://github.com/your-github-username/accounting-distribution-system.git"  # قم بتغيير هذا إلى مستودع GitHub الخاص بك
BRANCH="main"

# التحقق من وجود المتطلبات
echo "Checking requirements..."
for cmd in git node pnpm; do
    if ! command -v $cmd &> /dev/null; then
        echo "$cmd is not installed. Please install it before continuing."
        exit 1
    fi
done

# Creating application directory...ا لم يكن موجودًا
if [ ! -d "$APP_DIR" ]; then
    echo "Creating application directory..."
    sudo mkdir -p "$APP_DIR"
    sudo chown $(whoami):$(whoami) "$APP_DIR"
fi

# استنساخ أو تحديث المستودع
if [ -d "$APP_DIR/.git" ]; then
    echo "Updating repository..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
else
    echo "Cloning repository..."
    git clone -b $BRANCH $GITHUB_REPO "$APP_DIR"
    cd "$APP_DIR"
fi

# تثبيت الاعتماديات
echo "Installing dependencies..."
pnpm install

# Creating .env file...ا لم يكن موجودًا
if [ ! -f "$APP_DIR/.env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # طلب معلومات قاعدة البيانات
    echo "Please enter database information:"
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
echo "Building the application..."
pnpm run build

# تهيئة قاعدة البيانات
echo "Do you want to initialize the database? (y/n)"
read init_db
if [ "$init_db" = "y" ]; then
    echo "Initializing the database..."
    node -e "require('./lib/db').initializeDatabase().then(() => require('./lib/db').seedDatabase()).then(() => console.log('تم Initializing the database...جاح')).catch(err => console.error('خطأ في تهيئة قاعدة البيانات:', err)).finally(() => process.exit())"
fi

# إعداد PM2 إذا لم يكن موجودًا
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
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
      PORT: 3000
    }
  }]
};
EOL

# Restarting the application...ستخدام PM2
echo "Restarting the application..."
pm2 startOrRestart ecosystem.config.js

# تكوين PM2 للتشغيل عند بدء النظام
pm2 save
# Use the recommended startup command directly instead of piping output to bash
pm2 startup systemd -u "$(whoami)" --hp "$HOME"

# إعداد Nginx إذا لم يكن موجودًا
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# إنشاء ملف تكوين Nginx
echo "Creating Nginx configuration file..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOL
server {
    listen 80;
    server_name _;  # قم بتغيير هذا إلى اسم النطاق الخاص بك
    
    location / {
        # Explicitly use IPv4 to prevent issues when localhost resolves to IPv6
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

echo "Application deployed successfully!"
echo "You can access the application at: http://your-server-ip"
echo ""
echo "To set up SSL, you can use Let's Encrypt:"
echo "sudo apt-get install -y certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d your-domain.com"
