#!/bin/bash

# ألوان للطباعة
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# دالة للطباعة بألوان
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

# التحقق من وجود مجلد التطبيق
if [ ! -d "app" ]; then
  print_message "$RED" "خطأ: مجلد 'app' غير موجود. يرجى التأكد من تشغيل سكريبت 'install-all.sh' أولاً."
  exit 1
fi

print_message "$BLUE" "
=======================================================
      إعداد كود التطبيق لنظام المحاسبة والتوزيع
=======================================================
"

# إنشاء هيكل المجلدات
mkdir -p app/components/ui
mkdir -p app/lib
mkdir -p app/app/api/products
mkdir -p app/app/api/centers
mkdir -p app/app/api/sales
mkdir -p app/app/api/inventory
mkdir -p app/app/api/reports/product-inventory
mkdir -p app/app/api/reports/center-inventory
mkdir -p app/app/api/reports/center-sales
mkdir -p app/app/api/reports/inventory-log
mkdir -p app/app/api/import-products
mkdir -p app/app/api/metrics
mkdir -p app/app/api/init-db
mkdir -p app/app/dashboard
mkdir -p app/app/login
mkdir -p app/public/images

print_message "$GREEN" "✓ تم إنشاء هيكل المجلدات بنجاح"

# نسخ ملفات التطبيق من المجلد الحالي إلى مجلد app
print_message "$YELLOW" "جاري نسخ ملفات التطبيق..."

# قائمة بالملفات التي يجب نسخها
FILES_TO_COPY=(
  "lib/db.ts"
  "lib/redis.ts"
  "lib/types.ts"
  "lib/data-utils.ts"
  "lib/api-utils.ts"
  "lib/db-cache.ts"
  "components/dashboard.tsx"
  "components/header.tsx"
  "components/auth-check.tsx"
  "components/products.tsx"
  "components/distribution-centers.tsx"
  "components/inventory.tsx"
  "components/sales.tsx"
  "app/layout.tsx"
  "app/globals.css"
  "app/page.tsx"
  "app/login/page.tsx"
  "app/dashboard/layout.tsx"
  "app/dashboard/page.tsx"
  "app/api/init-db/route.ts"
  "app/api/products/route.ts"
  "app/api/products/[id]/route.ts"
  "app/api/centers/route.ts"
  "app/api/centers/[id]/route.ts"
  "app/api/sales/route.ts"
  "app/api/inventory/route.ts"
  "app/api/reports/product-inventory/[id]/route.ts"
  "app/api/reports/center-inventory/[id]/route.ts"
  "app/api/reports/center-sales/[id]/route.ts"
  "app/api/reports/inventory-log/route.ts"
  "app/api/import-products/route.ts"
  "app/api/metrics/route.ts"
  "middleware.ts"
  "next.config.mjs"
  "tailwind.config.ts"
)

# نسخ الملفات إذا كانت موجودة
for file in "${FILES_TO_COPY[@]}"; do
  if [ -f "$file" ]; then
    # إنشاء المجلد الهدف إذا لم يكن موجودًا
    mkdir -p "app/$(dirname "$file")"
    # نسخ الملف
    cp "$file" "app/$file"
    echo "تم نسخ: $file"
  else
    echo "تخطي: $file (غير موجود)"
  fi
done

# نسخ الصور إذا كانت موجودة
if [ -d "public/images" ]; then
  cp -r public/images/* app/public/images/
  echo "تم نسخ: الصور"
fi

print_message "$GREEN" "✓ تم نسخ ملفات التطبيق بنجاح"

# بناء وتشغيل الحاويات
print_message "$YELLOW" "جاري بناء وتشغيل الحاويات..."
docker-compose up -d --build

print_message "$GREEN" "✓ تم بناء وتشغيل الحاويات بنجاح"

# انتظار حتى تكون قاعدة البيانات جاهزة
print_message "$YELLOW" "انتظار حتى تكون قاعدة البيانات جاهزة..."
sleep 10

print_message "$GREEN" "✓ تم إعداد التطبيق بنجاح!"
print_message "$BLUE" "
=======================================================
                معلومات الوصول
=======================================================
"

print_message "$YELLOW" "يمكنك الوصول إلى التطبيق على: http://localhost:3000"
print_message "$YELLOW" "يمكنك الوصول إلى التطبيق من خلال Nginx على: http://localhost"

print_message "$BLUE" "
للمزيد من المعلومات، راجع ملف 'connection-info.txt'
"
