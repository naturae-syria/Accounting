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
print_message "$RED" "Error: 'app' directory not found. Please run 'install-all.sh' first."
  exit 1
fi

print_message "$BLUE" "
=======================================================
      Setting up application code for the accounting system
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

print_message "$GREEN" "✓ Folder structure created successfully"

# نسخ ملفات التطبيق من المجلد الحالي إلى مجلد app
print_message "$YELLOW" "Copying application files..."

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

# Copy files if they exist
for file in "${FILES_TO_COPY[@]}"; do
  if [ -f "$file" ]; then
    # Create target directory if it does not exist
    mkdir -p "app/$(dirname "$file")"
    # Copy the file
    cp "$file" "app/$file"
    echo "Copied: $file"
  else
    echo "Skipped: $file (not found)"
  fi
done

# Copy images if they exist
if [ -d "public/images" ]; then
  cp -r public/images/* app/public/images/
  echo "Copied: images"
fi

print_message "$GREEN" "✓ Application files copied successfully"

# بناء وتشغيل الحاويات
print_message "$YELLOW" "Building and starting containers..."
docker-compose up -d --build

print_message "$GREEN" "✓ Containers built and started successfully"

# انتظار حتى تكون قاعدة البيانات جاهزة
print_message "$YELLOW" "Waiting for the database to be ready..."
sleep 10

print_message "$GREEN" "✓ Application setup complete!"
print_message "$BLUE" "
=======================================================
                Access information
=======================================================
"

print_message "$YELLOW" "You can access the app at: http://localhost:3000"
print_message "$YELLOW" "You can access the app through Nginx at: http://localhost"

print_message "$BLUE" "
For more information, see the 'connection-info.txt' file
"
