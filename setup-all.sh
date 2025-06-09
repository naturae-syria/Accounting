#!/bin/bash
set -e

# تكوين المتغيرات
APP_NAME="accounting-system"
# allow overriding the repository to clone. Defaults to the public repository
# hosting this project to avoid authentication prompts during setup.
GITHUB_USERNAME=${GITHUB_USERNAME:-naturae-syria}
GITHUB_REPO=${GITHUB_REPO:-Accounting}
REPO_URL=${REPO_URL:-"https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"}
# اسم النطاق اختياري. الافتراضي هو localhost ويمكن تعديله لاحقًا
DOMAIN=${DOMAIN:-localhost}
USE_SSL=${USE_SSL:-false}

# السماح بتحديد نطاق مخصص عند التشغيل
read -p "Enter the domain name (default: $DOMAIN): " DOMAIN_INPUT
DOMAIN=${DOMAIN_INPUT:-$DOMAIN}

# التحقق من وجود المتطلبات
echo "Checking requirements..."
for cmd in git node pnpm; do
    if ! command -v $cmd &> /dev/null; then
        echo "$cmd is not installed. Installing..."
        sudo apt-get update
        sudo apt-get install -y $cmd
    fi
done

# Ensure helper scripts are executable
[ ! -x ./setup-db.sh ] && chmod +x ./setup-db.sh
[ ! -x ./setup-redis.sh ] && chmod +x ./setup-redis.sh

# إعداد قاعدة البيانات
echo "Setting up the database..."
./setup-db.sh

# إعداد Redis
echo "Setting up Redis..."
./setup-redis.sh

# استنساخ المستودع
echo "Cloning the repository..."
APP_DIR="/var/www/$APP_NAME"
sudo mkdir -p "$APP_DIR"
sudo chown $(whoami):$(whoami) "$APP_DIR"
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

# تثبيت الاعتماديات
echo "Installing dependencies..."
pnpm install
if [ ! -x node_modules/.bin/ts-node ]; then
    echo "ts-node not found after install. Attempting global install..."
    pnpm add -D ts-node || sudo npm install -g ts-node || true
fi

# إنشاء ملف .env
# إنشاء ملف .env
echo "Creating .env file..."
if [ -f .env.example ]; then
    cp .env.example .env
else
    cat > .env << EOF
DB_USER=$DB_USER
DB_HOST=$DB_HOST
DB_NAME=$DB_NAME
DB_PASSWORD=$DB_PASSWORD
DB_PORT=$DB_PORT
REDIS_URL=redis://localhost:6379
EOF
fi
# تحديث ملف .env بإعدادات قاعدة البيانات
sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" .env
sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env
sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env

# بناء التطبيق
echo "Building the application..."
pnpm run build

# إعداد PM2
echo "Setting up PM2..."
./setup-pm2.sh

# Install NexAccount CLI for managing the service
echo "Installing NexAccount CLI..."
sudo cp NexAccount /usr/local/bin/
sudo chmod +x /usr/local/bin/NexAccount

# إعداد Nginx
echo "Setting up Nginx..."
USE_SSL=$USE_SSL DOMAIN=$DOMAIN ./setup-nginx.sh

# إعداد النسخ الاحتياطي
echo "Setting up backups..."
sudo cp backup-db.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup-db.sh
# إضافة مهمة cron لتشغيل النسخ الاحتياطي يوميًا في الساعة 2 صباحًا
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh") | crontab -

# إعداد Fail2Ban
echo "Setting up Fail2Ban..."
./setup-fail2ban.sh

# إعداد الجدار الناري
echo "Configuring the firewall..."
./setup-firewall.sh

# إعداد المراقبة
echo "Setting up monitoring..."
./setup-monitoring.sh

echo "System setup completed successfully!"

# Gather service statuses
DB_STATUS=$(sudo systemctl is-active postgresql || true)
REDIS_STATUS=$(sudo systemctl is-active redis-server || true)
NGINX_STATUS=$(sudo systemctl is-active nginx || true)
PM2_STATUS=$(pm2 status "$APP_NAME" | grep -q online && echo "online" || echo "offline")

echo "\n==== Installation Summary ===="
echo "Application directory: $APP_DIR"
echo "Database service: $DB_STATUS on port $DB_PORT"
echo "Redis service: $REDIS_STATUS"
echo "Web service (Nginx): $NGINX_STATUS on http://$DOMAIN"
if [ "$USE_SSL" = "true" ]; then
    echo "HTTPS enabled at https://$DOMAIN"
fi
echo "PM2 process '$APP_NAME': $PM2_STATUS"
echo "Use the 'NexAccount' command to manage the application (Start|Stop|Restart|Status|Update|Delete)."
echo "If any service is not active you may need to restart the server."

# Display how to access the application
IP_ADDRESS=$(hostname -I | awk '{print $1}')
echo "\nAccess the application via:"
echo " - HTTP:  http://$DOMAIN (IP: $IP_ADDRESS, port 80)"
if [ "$USE_SSL" = "true" ]; then
    echo " - HTTPS: https://$DOMAIN (IP: $IP_ADDRESS, port 443)"
fi

# Remove temporary files created during installation
echo "Cleaning up temporary files..."
./cleanup-temp.sh
