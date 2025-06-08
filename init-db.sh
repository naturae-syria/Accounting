#!/bin/bash

# انتظار حتى تكون قاعدة البيانات جاهزة
echo "انتظار حتى تكون قاعدة البيانات جاهزة..."
until node -e "
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
pool.query('SELECT 1').then(() => {
  console.log('تم الاتصال بقاعدة البيانات بنجاح');
  process.exit(0);
}).catch(err => {
  console.error('خطأ في الاتصال بقاعدة البيانات:', err);
  process.exit(1);
});
"; do
  echo "قاعدة البيانات غير جاهزة بعد... انتظار 2 ثانية"
  sleep 2
done

# تهيئة قاعدة البيانات
echo "تهيئة قاعدة البيانات..."
npm run init-db
