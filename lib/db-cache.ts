// هذا مثال لكيفية تعديل دالة getProducts في lib/db.ts لدعم التخزين المؤقت
import { getCache, setCache, invalidateCache } from "./redis"
import type { Product } from "./definitions"
import { pool } from "./db"

export const getProducts = async (): Promise<Product[]> => {
  try {
    // محاولة الحصول على البيانات من التخزين المؤقت
    const cachedData = await getCache("products")
    if (cachedData) {
      return JSON.parse(cachedData)
    }

    // إذا لم تكن البيانات موجودة في التخزين المؤقت، استعلم من قاعدة البيانات
    const result = await pool.query(`
      SELECT id, name, description, price, cost, stock, brand, category, image
      FROM products
      ORDER BY name
    `)

    const products = result.rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      description: row.description || "",
      price: Number.parseFloat(row.price),
      cost: Number.parseFloat(row.cost),
      stock: row.stock,
      brand: row.brand || "",
      category: row.category || "",
      image: row.image || "",
    }))

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
  const client = await pool.connect()
  try {
    const result = await client.query(
      `
      INSERT INTO products (name, description, price, cost, stock, brand, category, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
      [
        product.name,
        product.description,
        product.price,
        product.cost,
        product.stock,
        product.brand,
        product.category,
        product.image,
      ],
    )

    const productId = result.rows[0].id

    // إلغاء صلاحية التخزين المؤقت للمنتجات
    await invalidateCache("products")

    return {
      id: productId.toString(),
      ...product,
    }
  } catch (error) {
    console.error("خطأ في إضافة المنتج:", error)
    throw error
  } finally {
    client.release()
  }
}
