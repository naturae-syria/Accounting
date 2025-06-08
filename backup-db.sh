#!/bin/bash

# تكوين المتغيرات
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-accounting_system}
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

# إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجودًا
mkdir -p $BACKUP_DIR

# إنشاء النسخة الاحتياطية
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/$DB_NAME-$DATE.sql.gz

# الاحتفاظ بالنسخ الاحتياطية لمدة 30 يومًا فقط
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete

echo "تم إنشاء نسخة احتياطية في: $BACKUP_DIR/$DB_NAME-$DATE.sql.gz"
