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
