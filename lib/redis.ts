import { createClient } from "redis"
import { env } from "./env"

// إنشاء عميل Redis
const createRedisClient = () => {
  // إذا لم يكن هناك رابط Redis، نعيد عميل وهمي
  if (!env.REDIS_URL) {
    console.log("تحذير: REDIS_URL غير محدد. سيتم تعطيل التخزين المؤقت.")
    return {
      isOpen: true,
      connect: async () => {},
      get: async () => null,
      set: async () => null,
      keys: async () => [],
      del: async () => 0,
      on: () => {},
    }
  }

  // إنشاء عميل Redis حقيقي
  return createClient({
    url: env.REDIS_URL,
  })
}

const redisClient = createRedisClient()

// معالجة الأخطاء
if (env.REDIS_URL) {
  redisClient.on("error", (err) => console.log("Redis Client Error", err))
}

// دالة للاتصال بـ Redis
export async function connectRedis() {
  if (!redisClient.isOpen && env.REDIS_URL) {
    await redisClient.connect()
  }
  return redisClient
}

// دالة للحصول على قيمة من التخزين المؤقت
export async function getCache(key: string) {
  try {
    const client = await connectRedis()
    return client.get(key)
  } catch (error) {
    console.error("خطأ في الحصول على التخزين المؤقت:", error)
    return null
  }
}

// دالة لتعيين قيمة في التخزين المؤقت
export async function setCache(key: string, value: string, expireInSeconds = 3600) {
  try {
    const client = await connectRedis()
    return client.set(key, value, { EX: expireInSeconds })
  } catch (error) {
    console.error("خطأ في تعيين التخزين المؤقت:", error)
    return null
  }
}

// دالة لإلغاء صلاحية التخزين المؤقت
export async function invalidateCache(pattern: string) {
  try {
    const client = await connectRedis()
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      return client.del(keys)
    }
    return 0
  } catch (error) {
    console.error("خطأ في إلغاء صلاحية التخزين المؤقت:", error)
    return 0
  }
}
