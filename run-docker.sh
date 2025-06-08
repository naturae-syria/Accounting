#!/bin/bash

# منح صلاحيات التنفيذ لسكريبت تهيئة قاعدة البيانات
chmod +x init-db.sh

# بناء وتشغيل الحاويات
docker-compose up -d

# انتظار حتى تكون الخدمات جاهزة
echo "انتظار حتى تكون الخدمات جاهزة..."
sleep 10

# تهيئة قاعدة البيانات
docker-compose exec app ./init-db.sh

echo "تم تشغيل التطبيق بنجاح!"
echo "يمكنك الوصول إلى التطبيق على: http://localhost:3000"
