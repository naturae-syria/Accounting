#!/bin/bash

# تكوين المتغيرات
REPO_NAME="accounting-distribution-system"
GITHUB_USERNAME="your-github-username"  # قم بتغيير هذا إلى اسم المستخدم الخاص بك على GitHub

# التحقق من تثبيت Git
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y git
fi

# Creating project directory...ا لم يكن موجودًا
if [ ! -d "$REPO_NAME" ]; then
    echo "Creating project directory..."
    mkdir -p "$REPO_NAME"
fi

# الانتقال إلى مجلد المشروع
cd "$REPO_NAME"

# Initializing Git repository...ا لم يكن موجودًا
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git branch -M main
fi

# إنشاء ملف .gitignore
cat > .gitignore << EOL
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOL

# إنشاء ملف README.md
cat > README.md << EOL
# نظام إدارة المحاسبة والتوزيع

نظام متكامل لإدارة المحاسبة وتوزيع المنتجات لشركة المؤيد العالمية.

## المميزات

- إدارة المنتجات
- إدارة مراكز التوزيع
- تتبع المبيعات
- إدارة المخزون
- تقارير متنوعة

## متطلبات النظام

- Node.js (v18 أو أحدث)
- PostgreSQL (v14 أو أحدث)
- Redis (اختياري، للتخزين المؤقت)

## التثبيت

1. استنساخ المستودع:
   \`\`\`bash
   git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
   cd $REPO_NAME
   \`\`\`

2. تثبيت الاعتماديات:
   \`\`\`bash
   pnpm install
   \`\`\`

3. إعداد متغيرات البيئة:
   \`\`\`bash
   cp .env.example .env
   # قم بتعديل ملف .env بإعدادات قاعدة البيانات الخاصة بك
   \`\`\`

4. تهيئة قاعدة البيانات:
   \`\`\`bash
   pnpm run init-db
   \`\`\`

5. تشغيل التطبيق في وضع التطوير:
   \`\`\`bash
   pnpm run dev
   \`\`\`

## النشر على الخادم

استخدم سكريبت \`deploy.sh\` لنشر التطبيق على الخادم:

\`\`\`bash
./deploy.sh
\`\`\`

## الترخيص

جميع الحقوق محفوظة © شركة المؤيد العالمية
EOL

# إنشاء ملف .env.example
cat > .env.example << EOL
# إعدادات قاعدة البيانات
DB_USER=postgres
DB_HOST=localhost
DB_NAME=accounting_system
DB_PASSWORD=your_password
DB_PORT=5432

# إعدادات Redis (اختياري)
REDIS_URL=redis://localhost:6379

# إعدادات التطبيق
NODE_ENV=production
PORT=3000
EOL

# إضافة الملفات إلى Git
git add .gitignore README.md .env.example

# إنشاء أول commit
git commit -m "إعداد المشروع الأولي"

# إضافة مستودع GitHub كمصدر بعيد
echo "Do you want to create a GitHub repository now? (y/n)"
read create_repo

if [ "$create_repo" = "y" ]; then
    # التحقق من تثبيت GitHub CLI
    if ! command -v gh &> /dev/null; then
        echo "GitHub CLI is not installed. Installing..."
        sudo apt-get update
        sudo apt-get install -y gh
    fi
    
    # تسجيل الدخول إلى GitHub إذا لم يكن مسجلاً بالفعل
    if ! gh auth status &> /dev/null; then
        echo "Please log in to GitHub..."
        gh auth login
    fi
    
    # إنشاء مستودع على GitHub
    echo "Creating GitHub repository..."
    gh repo create "$REPO_NAME" --private --source=. --remote=origin --push
else
    echo "You can create a GitHub repository manually and add it as a remote using:"
    echo "git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "git push -u origin main"
fi

echo "Project setup completed successfully!"
