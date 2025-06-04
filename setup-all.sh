#!/bin/bash

# تكوين المتغيرات
APP_NAME="accounting-system"
GITHUB_USERNAME="your-github-username"  # قم بتغيير هذا إلى اسم المستخدم الخاص بك على GitHub
GITHUB_REPO="accounting-distribution-system"
DOMAIN="your-domain.com"  # قم بتغيير هذا إلى اسم النطاق الخاص بك
USE_SSL=${USE_SSL:-false}

# التحقق من وجود المتطلبات
echo "التحقق من المتطلبات..."
for cmd in git node npm; do
    if ! command -v $cmd &> /dev/null; then
        echo "$cmd غير مثبت. جاري التثبيت..."
        sudo apt-get update
        sudo apt-get install -y $cmd
    fi
done

# إعداد قاعدة البيانات
echo "إعداد قاعدة البيانات..."
./setup-db.sh

# إعداد Redis
echo "إعداد Redis..."
./setup-redis.sh

# استنساخ المستودع
echo "استنساخ المستودع..."
APP_DIR="/var/www/$APP_NAME"
sudo mkdir -p "$APP_DIR"
sudo chown $(whoami):$(whoami) "$APP_DIR"
git clone https://github.com/$GITHUB_USERNAME/$GITHUB_REPO.git "$APP_DIR"
cd "$APP_DIR"

# تثبيت الاعتماديات
echo "تثبيت الاعتماديات..."
npm ci

# إنشاء ملف .env
echo "إنشاء ملف .env..."
cp .env.example .env
# تحديث ملف .env بإعدادات قاعدة البيانات
sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" .env
sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env
sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env

# بناء التطبيق
echo "بناء التطبيق..."
npm run build

# إعداد PM2
echo "إعداد PM2..."
./setup-pm2.sh

# إعداد Nginx
echo "إعداد Nginx..."
USE_SSL=$USE_SSL DOMAIN=$DOMAIN ./setup-nginx.sh

# إعداد النسخ الاحتياطي
echo "إعداد النسخ الاحتياطي..."
sudo cp backup-db.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup-db.sh
# إضافة مهمة cron لتشغيل النسخ الاحتياطي يوميًا في الساعة 2 صباحًا
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh") | crontab -

# إعداد Fail2Ban
echo "إعداد Fail2Ban..."
./setup-fail2ban.sh

# إعداد المراقبة
echo "إعداد المراقبة..."
./setup-monitoring.sh

echo "تم إعداد النظام بنجاح!"
echo "يمكنك الوصول إلى التطبيق على: http://$DOMAIN"
if [ "$USE_SSL" = "true" ]; then
    echo "أو: https://$DOMAIN"
fi
