#!/bin/bash

# تكوين المتغيرات
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_NAME=${DB_NAME:-accounting_system}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_PORT=${DB_PORT:-5432}

# التحقق من تثبيت PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL غير مثبت. جاري التثبيت..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
fi

# إنشاء قاعدة البيانات والمستخدم
echo "إنشاء قاعدة البيانات والمستخدم..."
sudo -u postgres psql << EOF
-- إنشاء المستخدم إذا لم يكن موجودًا
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

-- إنشاء قاعدة البيانات إذا لم تكن موجودة
SELECT 'CREATE DATABASE $DB_NAME' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

# تهيئة قاعدة البيانات
echo "تهيئة قاعدة البيانات..."
export DB_USER=$DB_USER
export DB_HOST=$DB_HOST
export DB_NAME=$DB_NAME
export DB_PASSWORD=$DB_PASSWORD
export DB_PORT=$DB_PORT

# تشغيل سكريبت تهيئة قاعدة البيانات
pnpm run init-db

echo "تم إعداد قاعدة البيانات بنجاح!"
