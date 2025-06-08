#!/bin/bash

# Configure variables
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_NAME=${DB_NAME:-accounting_system}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_PORT=${DB_PORT:-5432}

# Check for PostgreSQL installation
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
fi

# Create database and user
echo "Creating database and user..."
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

# Initialize the database
echo "Initializing the database..."
export DB_USER=$DB_USER
export DB_HOST=$DB_HOST
export DB_NAME=$DB_NAME
export DB_PASSWORD=$DB_PASSWORD
export DB_PORT=$DB_PORT

# تشغيل سكريبت تهيئة قاعدة البيانات
pnpm run init-db

echo "Database setup completed!"
