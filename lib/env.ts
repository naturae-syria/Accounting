import { z } from 'zod'
import { config } from 'dotenv'

// Load environment variables from .env if present
config()

const envSchema = z.object({
  DB_USER: z.string(),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.preprocess((v) => Number(v), z.number().int()),
  REDIS_URL: z.string().url().optional(),
  // Provide secure credentials for the built-in admin user
  ADMIN_USER: z.string().default('your_admin_user'),
  ADMIN_PASS: z.string().default('your_admin_password'),
})

export const env = envSchema.parse(process.env)
