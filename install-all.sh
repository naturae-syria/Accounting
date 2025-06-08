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

# دالة للتحقق من وجود أمر
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# دالة لتوليد كلمة مرور عشوائية
generate_password() {
  local length=$1
  [ -z "$length" ] && length=16
  tr -dc 'A-Za-z0-9!#$%&()*+,-./:;<=>?@[\]^_`{|}~' </dev/urandom | head -c "$length"
}

# دالة للتحقق من نجاح الأمر السابق
check_success() {
  if [ $? -eq 0 ]; then
    print_message "$GREEN" "✓ $1"
  else
    print_message "$RED" "✗ $1"
    print_message "$RED" "حدث خطأ. إيقاف التثبيت."
    exit 1
  fi
}

# طباعة رسالة الترحيب
print_message "$BLUE" "
=======================================================
      تثبيت نظام المحاسبة والتوزيع باستخدام Docker
=======================================================
"

# التحقق من وجود Docker
if ! command_exists docker; then
  print_message "$YELLOW" "Docker غير مثبت. جاري التثبيت..."
  
  # تثبيت المتطلبات الأساسية
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

  # إضافة مفتاح GPG الرسمي لـ Docker
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  
  # إضافة مستودع Docker
  sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  
  # تثبيت Docker
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io
  
  # تمكين وبدء خدمة Docker
  sudo systemctl enable docker
  sudo systemctl start docker
  
  # إضافة المستخدم الحالي إلى مجموعة docker
  sudo usermod -aG docker $USER
  
  check_success "تم تثبيت Docker بنجاح"
  
  print_message "$YELLOW" "يرجى تسجيل الخروج وإعادة تسجيل الدخول لتطبيق تغييرات المجموعة، ثم تشغيل هذا السكريبت مرة أخرى."
  exit 0
else
  print_message "$GREEN" "✓ Docker مثبت بالفعل"
fi

# التحقق من وجود Docker Compose
if ! command_exists docker-compose; then
  print_message "$YELLOW" "Docker Compose غير مثبت. جاري التثبيت..."
  
  # تثبيت Docker Compose
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  
  check_success "تم تثبيت Docker Compose بنجاح"
else
  print_message "$GREEN" "✓ Docker Compose مثبت بالفعل"
fi

# إنشاء مجلد للمشروع
PROJECT_DIR="accounting-system"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

print_message "$BLUE" "جاري إنشاء ملفات التكوين..."

# توليد كلمات مرور عشوائية
DB_PASSWORD=$(generate_password 16)
REDIS_PASSWORD=$(generate_password 16)
APP_SECRET=$(generate_password 32)

# إنشاء ملف Dockerfile
cat > Dockerfile << 'EOF'
# استخدام صورة Node.js الرسمية
FROM node:18-alpine AS base

# تعيين مجلد العمل
WORKDIR /app

# نسخ ملفات تعريف الحزم
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./

# تثبيت الاعتماديات
FROM base AS deps
RUN pnpm install --frozen-lockfile

# بناء التطبيق
FROM deps AS builder
COPY . .
RUN pnpm run build

# إنشاء صورة الإنتاج
FROM base AS runner
ENV NODE_ENV production

# إنشاء مستخدم غير جذري لتشغيل التطبيق
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# نسخ الملفات المطلوبة من مرحلة البناء
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# تعريض المنفذ
EXPOSE 3000

# تعيين متغيرات البيئة
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# تشغيل التطبيق
CMD ["pnpm", "start"]
EOF

# إنشاء ملف docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
    environment:
      - NODE_ENV=production
      - DB_USER=postgres
      - DB_HOST=db
      - DB_NAME=accounting_system
      - DB_PASSWORD=$DB_PASSWORD
      - DB_PORT=5432
      - REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379
      - APP_SECRET=$APP_SECRET
    volumes:
      - ./app:/app
      - ./public:/app/public
    networks:
      - app-network

  db:
    image: postgres:14-alpine
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=$DB_PASSWORD
      - POSTGRES_DB=accounting_system
    ports:
      - "5432:5432"
    networks:
      - app-network

  redis:
    image: redis:alpine
    restart: always
    command: redis-server --requirepass $REDIS_PASSWORD
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
      - ./public:/usr/share/nginx/html
    depends_on:
      - app
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
EOF

# إنشاء مجلد للتطبيق
mkdir -p app
mkdir -p public
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p init-scripts

# إنشاء ملف تكوين Nginx
cat > nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # تكوين ضغط Gzip
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/javascript
        application/json
        application/x-javascript
        text/css
        text/javascript
        text/plain
        text/xml;
    
    # تخزين مؤقت للملفات الثابتة
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://app:3000;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# إنشاء سكريبت تهيئة قاعدة البيانات
cat > init-scripts/init-db.sql << 'EOF'
-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  cost NUMERIC(12, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  brand VARCHAR(100),
  category VARCHAR(100),
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول مراكز التوزيع
CREATE TABLE IF NOT EXISTS distribution_centers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  commission_rate NUMERIC(5, 2) DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المبيعات
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  center_id INTEGER REFERENCES distribution_centers(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المخزون
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  center_id INTEGER REFERENCES distribution_centers(id),
  initial_quantity INTEGER NOT NULL,
  current_quantity INTEGER NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, center_id)
);

-- إنشاء جدول سجل المخزون
CREATE TABLE IF NOT EXISTS inventory_log (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  center_id INTEGER REFERENCES distribution_centers(id),
  quantity INTEGER NOT NULL,
  operation_type VARCHAR(20) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إضافة منتجات تجريبية
INSERT INTO products (name, description, price, cost, stock, brand, category, image)
VALUES 
('مزيل عرق كريم أفون للنساء بدون عطر – 50غ', 'تركيبة لطيفة وخالية من العطور، تحمي من التعرق وتناسب البشرة الحساسة دون التسبب في التهيج.', 45000, 31500, 100, 'Avon', 'العناية الشخصية', 'images/135727.png'),
('كريم أفون كير لليدين بالسيليكون – 75غ', 'يحتوي على السيليكون الذي يشكل طبقة واقية على اليدين، يحمي من الجفاف ويمنح ترطيبًا عميقًا.', 70950, 49665, 50, 'Avon', 'عناية باليدين', 'images/161063.png'),
('كريم الوجه النهاري أفون كير بالفيتامينات المتعددة – 100غ', 'يحتوي على مزيج من الفيتامينات A، C، و E، يمنح البشرة إشراقًا وترطيبًا مع حماية خفيفة من العوامل البيئية.', 118690, 83083, 75, 'Avon', 'عناية بالبشرة', 'images/152724.png');

-- إضافة مراكز توزيع تجريبية
INSERT INTO distribution_centers (name, address, contact_person, phone, email, commission_rate)
VALUES 
('صيدلية الشفاء', 'شارع الرئيسي، دمشق', 'أحمد محمد', '0911234567', 'ahmed@example.com', 10),
('صيدلية الرحمة', 'شارع الجلاء، حلب', 'سارة خالد', '0921234567', 'sara@example.com', 12);

-- إضافة سجلات مخزون للمنتجات في مراكز التوزيع
DO $$
DECLARE
    product_id INTEGER;
    center_id INTEGER;
    quantity INTEGER;
BEGIN
    FOR product_id IN SELECT id FROM products
    LOOP
        FOR center_id IN SELECT id FROM distribution_centers
        LOOP
            quantity := floor(random() * 20) + 5; -- كمية عشوائية بين 5-25
            INSERT INTO inventory (product_id, center_id, initial_quantity, current_quantity)
            VALUES (product_id, center_id, quantity, quantity)
            ON CONFLICT (product_id, center_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
EOF

# إنشاء سكريبت النسخ الاحتياطي
cat > backup-db.sh << 'EOF'
#!/bin/bash

# تعيين التاريخ والوقت الحاليين
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"

# إنشاء مجلد النسخ الاحتياطي إذا لم يكن موجودًا
mkdir -p $BACKUP_DIR

# إنشاء نسخة احتياطية من قاعدة البيانات
docker-compose exec -T db pg_dump -U postgres accounting_system > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# حذف النسخ الاحتياطية القديمة (الاحتفاظ بآخر 7 نسخ)
ls -tp $BACKUP_DIR/backup_*.sql | grep -v '/$' | tail -n +8 | xargs -I {} rm -- {}

echo "تم إنشاء نسخة احتياطية بنجاح: $BACKUP_DIR/backup_$TIMESTAMP.sql"
EOF

# جعل سكريبت النسخ الاحتياطي قابل للتنفيذ
chmod +x backup-db.sh

# إنشاء سكريبت لإعداد cron للنسخ الاحتياطي التلقائي
cat > setup-backup-cron.sh << 'EOF'
#!/bin/bash

# إضافة مهمة cron للنسخ الاحتياطي اليومي في الساعة 2 صباحًا
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup-db.sh >> $(pwd)/backups/backup.log 2>&1") | crontab -

echo "تم إعداد النسخ الاحتياطي التلقائي اليومي في الساعة 2 صباحًا"
EOF

# جعل سكريبت إعداد cron قابل للتنفيذ
chmod +x setup-backup-cron.sh

# إنشاء سكريبت لاستعادة النسخ الاحتياطي
cat > restore-db.sh << 'EOF'
#!/bin/bash

# التحقق من وجود ملف النسخ الاحتياطي
if [ -z "$1" ]; then
    echo "الاستخدام: $0 <ملف النسخ الاحتياطي>"
    echo "مثال: $0 ./backups/backup_20230101_120000.sql"
    exit 1
fi

BACKUP_FILE=$1

# التحقق من وجود الملف
if [ ! -f "$BACKUP_FILE" ]; then
    echo "خطأ: ملف النسخ الاحتياطي غير موجود: $BACKUP_FILE"
    exit 1
fi

# استعادة قاعدة البيانات
echo "جاري استعادة قاعدة البيانات من $BACKUP_FILE..."
cat $BACKUP_FILE | docker-compose exec -T db psql -U postgres accounting_system

echo "تم استعادة قاعدة البيانات بنجاح"
EOF

# جعل سكريبت الاستعادة قابل للتنفيذ
chmod +x restore-db.sh

# إنشاء سكريبت لمراقبة الحاويات
cat > monitor.sh << 'EOF'
#!/bin/bash

# عرض حالة الحاويات
echo "حالة الحاويات:"
docker-compose ps

# عرض استخدام الموارد
echo -e "\nاستخدام الموارد:"
docker stats --no-stream $(docker-compose ps -q)

# عرض سجلات التطبيق
echo -e "\nآخر 10 سطور من سجلات التطبيق:"
docker-compose logs --tail=10 app
EOF

# جعل سكريبت المراقبة قابل للتنفيذ
chmod +x monitor.sh

# إنشاء ملف .env من القالب
cp .env.example .env
sed -i "s/DB_HOST=.*/DB_HOST=db/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
sed -i "s#REDIS_URL=.*#REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379#" .env
echo "APP_SECRET=$APP_SECRET" >> .env

# إنشاء ملف .dockerignore
cat > .dockerignore << 'EOF'
.git
.github
node_modules
npm-debug.log
Dockerfile
.dockerignore
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
README.md
backups
EOF

# إنشاء ملف package.json أساسي
cat > package.json << 'EOF'
{
  "name": "accounting-distribution-system",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.6",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.4",
    "class-variance-authority": "^0.6.1",
    "clsx": "^1.2.1",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.258.0",
    "next": "13.4.9",
    "pg": "^8.11.1",
    "react": "18.2.0",
    "react-day-picker": "^8.8.0",
    "react-dom": "18.2.0",
    "recharts": "^2.7.2",
    "redis": "^4.6.7",
    "tailwind-merge": "^1.13.2",
    "tailwindcss-animate": "^1.0.6"
  },
  "devDependencies": {
    "@types/node": "20.4.1",
    "@types/pg": "^8.10.2",
    "@types/react": "18.2.14",
    "@types/react-dom": "18.2.6",
    "autoprefixer": "10.4.14",
    "eslint": "8.44.0",
    "eslint-config-next": "13.4.9",
    "postcss": "8.4.25",
    "tailwindcss": "3.3.2",
    "typescript": "5.1.6"
  }
}
EOF

# إنشاء سكريبت لبدء تشغيل التطبيق
cat > start.sh << 'EOF'
#!/bin/bash

# بناء وتشغيل الحاويات
docker-compose up -d

echo "تم بدء تشغيل التطبيق بنجاح!"
echo "يمكنك الوصول إلى التطبيق على: http://localhost:3000"
echo "يمكنك الوصول إلى قاعدة البيانات على: localhost:5432"
echo "يمكنك الوصول إلى Redis على: localhost:6379"
EOF

# جعل سكريبت البدء قابل للتنفيذ
chmod +x start.sh

# إنشاء سكريبت لإيقاف التطبيق
cat > stop.sh << 'EOF'
#!/bin/bash

# إيقاف الحاويات
docker-compose down

echo "تم إيقاف التطبيق بنجاح!"
EOF

# جعل سكريبت الإيقاف قابل للتنفيذ
chmod +x stop.sh

# إنشاء سكريبت لإعادة تشغيل التطبيق
cat > restart.sh << 'EOF'
#!/bin/bash

# إعادة تشغيل الحاويات
docker-compose restart

echo "تم إعادة تشغيل التطبيق بنجاح!"
EOF

# جعل سكريبت إعادة التشغيل قابل للتنفيذ
chmod +x restart.sh

# إنشاء مجلد للنسخ الاحتياطي
mkdir -p backups

print_message "$GREEN" "✓ تم إنشاء جميع ملفات التكوين بنجاح"

# طباعة معلومات الاتصال
print_message "$BLUE" "
=======================================================
                معلومات الاتصال
=======================================================
"

print_message "$YELLOW" "قاعدة البيانات PostgreSQL:"
echo "المضيف: localhost"
echo "المنفذ: 5432"
echo "اسم المستخدم: postgres"
echo "كلمة المرور: $DB_PASSWORD"
echo "اسم قاعدة البيانات: accounting_system"

print_message "$YELLOW" "Redis:"
echo "المضيف: localhost"
echo "المنفذ: 6379"
echo "كلمة المرور: $REDIS_PASSWORD"
echo "عنوان URL: redis://:$REDIS_PASSWORD@localhost:6379"

print_message "$YELLOW" "التطبيق:"
echo "عنوان URL: http://localhost:3000"
echo "عنوان URL (من خلال Nginx): http://localhost"

print_message "$BLUE" "
=======================================================
                الأوامر المتاحة
=======================================================
"

print_message "$YELLOW" "./start.sh"
echo "لبدء تشغيل التطبيق"

print_message "$YELLOW" "./stop.sh"
echo "لإيقاف التطبيق"

print_message "$YELLOW" "./restart.sh"
echo "لإعادة تشغيل التطبيق"

print_message "$YELLOW" "./backup-db.sh"
echo "لإنشاء نسخة احتياطية من قاعدة البيانات"

print_message "$YELLOW" "./restore-db.sh <ملف النسخ الاحتياطي>"
echo "لاستعادة قاعدة البيانات من نسخة احتياطية"

print_message "$YELLOW" "./setup-backup-cron.sh"
echo "لإعداد النسخ الاحتياطي التلقائي اليومي"

print_message "$YELLOW" "./monitor.sh"
echo "لمراقبة حالة الحاويات واستخدام الموارد"

print_message "$GREEN" "
=======================================================
                تم الإعداد بنجاح!
=======================================================

الآن، قم بنسخ كود التطبيق الخاص بك إلى مجلد 'app'
ثم قم بتشغيل './start.sh' لبدء تشغيل التطبيق.
"

# حفظ معلومات الاتصال في ملف
cat > connection-info.txt << EOF
=======================================================
                معلومات الاتصال
=======================================================

قاعدة البيانات PostgreSQL:
المضيف: localhost
المنفذ: 5432
اسم المستخدم: postgres
كلمة المرور: $DB_PASSWORD
اسم قاعدة البيانات: accounting_system

Redis:
المضيف: localhost
المنفذ: 6379
كلمة المرور: $REDIS_PASSWORD
عنوان URL: redis://:$REDIS_PASSWORD@localhost:6379

التطبيق:
عنوان URL: http://localhost:3000
عنوان URL (من خلال Nginx): http://localhost

=======================================================
                الأوامر المتاحة
=======================================================

./start.sh
لبدء تشغيل التطبيق

./stop.sh
لإيقاف التطبيق

./restart.sh
لإعادة تشغيل التطبيق

./backup-db.sh
لإنشاء نسخة احتياطية من قاعدة البيانات

./restore-db.sh <ملف النسخ الاحتياطي>
لاستعادة قاعدة البيانات من نسخة احتياطية

./setup-backup-cron.sh
لإعداد النسخ الاحتياطي التلقائي اليومي

./monitor.sh
لمراقبة حالة الحاويات واستخدام الموارد
EOF

print_message "$YELLOW" "تم حفظ معلومات الاتصال في ملف 'connection-info.txt'"
