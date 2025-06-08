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
read -p "أدخل اسم النطاق (الافتراضي: $DOMAIN): " DOMAIN_INPUT
DOMAIN=${DOMAIN_INPUT:-$DOMAIN}

# التحقق من وجود المتطلبات
echo "التحقق من المتطلبات..."
for cmd in git node pnpm; do
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
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

# تثبيت الاعتماديات
echo "تثبيت الاعتماديات..."
pnpm install

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
pnpm run build

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
