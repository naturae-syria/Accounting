// هذا مثال لكيفية تعديل دالة getProducts في lib/db.ts لدعم التخزين المؤقت
import { getCache, setCache, invalidateCache } from "./redis"
import type { Product, DistributionCenter } from "./types"
import * as db from "./db"

export const getProducts = async (): Promise<Product[]> => {
  try {
    // محاولة الحصول على البيانات من التخزين المؤقت
    const cachedData = await getCache("products")
    if (cachedData) {
      return JSON.parse(cachedData)
    }

    // إذا لم تكن البيانات موجودة في التخزين المؤقت، استعلم من قاعدة البيانات
    const products = await db.getProducts()

    // تخزين البيانات في التخزين المؤقت
    await setCache("products", JSON.stringify(products), 300) // تخزين لمدة 5 دقائق

    return products
  } catch (error) {
    console.error("خطأ في الحصول على المنتجات:", error)
    throw error
  }
}

// تعديل دوال التعديل لإلغاء صلاحية التخزين المؤقت
export const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  try {
    const created = await db.addProduct(product)
    await invalidateCache("products")
    return created
  } catch (error) {
    console.error("خطأ في إضافة المنتج:", error)
    throw error
  }
}

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    const updated = await db.updateProduct(id, product)
    await invalidateCache("products")
    return updated
  } catch (error) {
    console.error("خطأ في تحديث المنتج:", error)
    throw error
  }
}

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const success = await db.deleteProduct(id)
    await invalidateCache("products")
    return success
  } catch (error) {
    console.error("خطأ في حذف المنتج:", error)
    throw error
  }
}

export const getDistributionCenters = async (): Promise<DistributionCenter[]> => {
  try {
    const cachedData = await getCache("centers")
    if (cachedData) {
      return JSON.parse(cachedData)
    }

    const centers = await db.getDistributionCenters()
    await setCache("centers", JSON.stringify(centers), 300)
    return centers
  } catch (error) {
    console.error("خطأ في الحصول على مراكز التوزيع:", error)
    throw error
  }
}

export const addDistributionCenter = async (
  center: Omit<DistributionCenter, "id">,
): Promise<DistributionCenter> => {
  try {
    const created = await db.addDistributionCenter(center)
    await invalidateCache("centers")
    return created
  } catch (error) {
    console.error("خطأ في إضافة مركز التوزيع:", error)
    throw error
  }
}

export const updateDistributionCenter = async (
  id: string,
  center: Partial<DistributionCenter>,
): Promise<DistributionCenter> => {
  try {
    const updated = await db.updateDistributionCenter(id, center)
    await invalidateCache("centers")
    return updated
  } catch (error) {
    console.error("خطأ في تحديث مركز التوزيع:", error)
    throw error
  }
}

export const deleteDistributionCenter = async (id: string): Promise<boolean> => {
  try {
    const success = await db.deleteDistributionCenter(id)
    await invalidateCache("centers")
    return success
  } catch (error) {
    console.error("خطأ في حذف مركز التوزيع:", error)
    throw error
  }
}
