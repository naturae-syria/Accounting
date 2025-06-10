import { z } from 'zod'

const envSchema = z
  .object({
    DB_USER: z.string().optional(),
    DB_HOST: z.string().optional(),
    DB_NAME: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_PORT: z.preprocess((v) => Number(v), z.number().int()).optional(),
    DATABASE_URL: z
      .preprocess(
        (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
        z.string().url().optional()
      ),
    REDIS_URL: z.string().url().optional(),
    ADMIN_USER: z.string().default('admin'),
    ADMIN_PASS: z.string().default('admin123'),
  })
  .refine((data) => {
    if (data.DATABASE_URL) return true
    return (
      data.DB_USER &&
      data.DB_HOST &&
      data.DB_NAME &&
      data.DB_PASSWORD &&
      typeof data.DB_PORT === 'number'
    )
  }, {
    message: 'Either DATABASE_URL or DB_* variables must be provided',
  })

export const env = envSchema.parse(process.env)
