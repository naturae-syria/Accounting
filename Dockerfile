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
# Provide default environment variables during build by copying the example file
COPY .env.example .env
RUN pnpm run build

# إنشاء صورة الإنتاج
FROM base AS runner
ENV NODE_ENV production

# نسخ ملفات التعريف لتثبيت اعتماديات الإنتاج
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --prod

# Default environment variables for runtime if none are provided
COPY --from=builder /app/.env ./

# إنشاء مستخدم غير جذري لتشغيل التطبيق
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# نسخ الملفات المطلوبة من مرحلة البناء
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/.next ./.next
USER nextjs

# تعريض المنفذ
EXPOSE 3000

# تعيين متغيرات البيئة
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# تشغيل التطبيق
CMD ["pnpm", "start"]
