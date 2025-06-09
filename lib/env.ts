import { z } from 'zod'

const envSchema = z.object({
  DB_USER: z.string(),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.preprocess((v) => Number(v), z.number().int()),
  REDIS_URL: z.string().url().optional(),
  ADMIN_USER: z.string().default('admin'),
  ADMIN_PASS: z.string().default('admin123'),
})

export const env = envSchema.parse(process.env)
