import { Pool } from "pg"
import type {
  Product,
  DistributionCenter,
  Sale,
  ProductInventory,
  CustomReport,
} from "./types"
import { env } from "./env"
import { hashPassword } from "./auth"

// إعداد الاتصال بقاعدة البيانات
export const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
})

// التحقق من الاتصال بقاعدة البيانات
export const testConnection = async () => {
  try {
    const client = await pool.connect()
    console.log("تم الاتصال بقاعدة البيانات بنجاح")
    client.release()
    return true
  } catch (error) {
    console.error("خطأ في الاتصال بقاعدة البيانات:", error)
    return false
  }
}

// إنشاء الجداول إذا لم تكن موجودة
export const initializeDatabase = async () => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // إنشاء جدول المنتجات
    await client.query(`
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
      )
    `)

    // إنشاء جدول مراكز التوزيع
    await client.query(`
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
      )
    `)

    // إنشاء جدول المبيعات
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        center_id INTEGER REFERENCES distribution_centers(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(12, 2) NOT NULL,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // إنشاء جدول المخزون
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        center_id INTEGER REFERENCES distribution_centers(id),
        initial_quantity INTEGER NOT NULL,
        current_quantity INTEGER NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(product_id, center_id)
      )
    `)

    // إنشاء جدول سجل المخزون
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_log (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        center_id INTEGER REFERENCES distribution_centers(id),
        quantity INTEGER NOT NULL,
        operation_type VARCHAR(20) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // إنشاء جدول التقارير المخصصة
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_reports (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        columns TEXT[] NOT NULL DEFAULT '{}',
        filters JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // إنشاء جدول المستخدمين لتخزين بيانات تسجيل الدخول
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await client.query("COMMIT")
    console.log("تم إنشاء الجداول بنجاح")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("خطأ في إنشاء الجداول:", error)
    throw error
  } finally {
    client.release()
  }
}

// إضافة بيانات تجريبية إذا كانت الجداول فارغة
export const seedDatabase = async () => {
  const client = await pool.connect()
  try {
    // التحقق من وجود منتجات
    const productsResult = await client.query("SELECT COUNT(*) FROM products")
    if (Number.parseInt(productsResult.rows[0].count) === 0) {
      // إضافة منتجات تجريبية
      await client.query(`
        INSERT INTO products (name, description, price, cost, stock, brand, category, image)
        VALUES 
        ('مزيل عرق كريم أفون للنساء بدون عطر – 50غ', 'تركيبة لطيفة وخالية من العطور، تحمي من التعرق وتناسب البشرة الحساسة دون التسبب في التهيج.', 45000, 31500, 100, 'Avon', 'العناية الشخصية', '/images/135727.png'),
        ('كريم أفون كير لليدين بالسيليكون – 75غ', 'يحتوي على السيليكون الذي يشكل طبقة واقية على اليدين، يحمي من الجفاف ويمنح ترطيبًا عميقًا.', 70950, 49665, 50, 'Avon', 'عناية باليدين', '/images/161063.png'),
        ('كريم الوجه النهاري أفون كير بالفيتامينات المتعددة – 100غ', 'يحتوي على مزيج من الفيتامينات A، C، و E، يمنح البشرة إشراقًا وترطيبًا مع حماية خفيفة من العوامل البيئية.', 118690, 83083, 75, 'Avon', 'عناية بالبشرة', '/images/152724.png')
      `)
      console.log("تم إضافة منتجات تجريبية")
    }

    // التحقق من وجود مراكز توزيع
    const centersResult = await client.query("SELECT COUNT(*) FROM distribution_centers")
    if (Number.parseInt(centersResult.rows[0].count) === 0) {
      // إضافة مراكز توزيع تجريبية
      await client.query(`
        INSERT INTO distribution_centers (name, address, contact_person, phone, email, commission_rate)
        VALUES 
        ('صيدلية الشفاء', 'شارع الرئيسي، دمشق', 'أحمد محمد', '0911234567', 'ahmed@example.com', 10),
        ('صيدلية الرحمة', 'شارع الجلاء، حلب', 'سارة خالد', '0921234567', 'sara@example.com', 12)
      `)
      console.log("تم إضافة مراكز توزيع تجريبية")
    }

    // إضافة سجلات مخزون للمنتجات في مراكز التوزيع
    const inventoryResult = await client.query("SELECT COUNT(*) FROM inventory")
    if (Number.parseInt(inventoryResult.rows[0].count) === 0) {
      // الحصول على المنتجات ومراكز التوزيع
      const products = await client.query("SELECT id FROM products")
      const centers = await client.query("SELECT id FROM distribution_centers")

      // إضافة سجلات مخزون
      for (const product of products.rows) {
        for (const center of centers.rows) {
          const quantity = Math.floor(Math.random() * 20) + 5 // كمية عشوائية بين 5-25
          await client.query(
            `
            INSERT INTO inventory (product_id, center_id, initial_quantity, current_quantity)
            VALUES ($1, $2, $3, $3)
            ON CONFLICT (product_id, center_id) DO NOTHING
          `,
            [product.id, center.id, quantity],
          )
        }
      }
      console.log("تم إضافة سجلات مخزون تجريبية")
    }

    // إضافة مبيعات تجريبية
    const salesResult = await client.query("SELECT COUNT(*) FROM sales")
    if (Number.parseInt(salesResult.rows[0].count) === 0) {
      // الحصول على المنتجات ومراكز التوزيع
      const products = await client.query("SELECT id, price FROM products")
      const centers = await client.query("SELECT id FROM distribution_centers")

      // إضافة سجلات مبيعات
      const now = new Date()
      for (let i = 0; i < 3; i++) {
        const product = products.rows[i % products.rows.length]
        const center = centers.rows[i % centers.rows.length]
        const quantity = Math.floor(Math.random() * 5) + 1
        const saleDate = new Date(now)
        saleDate.setDate(now.getDate() - i * 2) // مبيعات في أيام مختلفة

        await client.query(
          `
          INSERT INTO sales (product_id, center_id, quantity, price, sale_date)
          VALUES ($1, $2, $3, $4, $5)
        `,
          [product.id, center.id, quantity, product.price, saleDate],
        )

        // تحديث المخزون
        await client.query(
          `
          UPDATE inventory 
          SET current_quantity = current_quantity - $1, last_updated = CURRENT_TIMESTAMP
          WHERE product_id = $2 AND center_id = $3
        `,
          [quantity, product.id, center.id],
        )

        // تحديث مخزون المنتج
        await client.query(
          `
          UPDATE products 
          SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `,
          [quantity, product.id],
        )
      }
      console.log("تم إضافة مبيعات تجريبية")
    }

    // إضافة مستخدم المدير إذا لم يكن موجودًا
    const usersResult = await client.query('SELECT COUNT(*) FROM users')
    if (Number.parseInt(usersResult.rows[0].count) === 0) {
      const hash = await hashPassword(env.ADMIN_PASS)
      await client.query(
        `INSERT INTO users (username, password_hash) VALUES ($1, $2)`,
        [env.ADMIN_USER, hash],
      )
      console.log('تم إنشاء مستخدم المدير')
    }
  } catch (error) {
    console.error("خطأ في إضافة البيانات التجريبية:", error)
    throw error
  } finally {
    client.release()
  }
}

// دوال التعامل مع المنتجات
export const getProducts = async (): Promise<Product[]> => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, price, cost, stock, brand, category, image
      FROM products
      ORDER BY name
    `)
    return result.rows.map((row: any) => ({
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
  } catch (error) {
    console.error("خطأ في الحصول على المنتجات:", error)
    throw error
  }
}

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, description, price, cost, stock, brand, category, image
      FROM products
      WHERE id = $1
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id.toString(),
      name: row.name,
      description: row.description || "",
      price: Number.parseFloat(row.price),
      cost: Number.parseFloat(row.cost),
      stock: row.stock,
      brand: row.brand || "",
      category: row.category || "",
      image: row.image || "",
    }
  } catch (error) {
    console.error("خطأ في الحصول على المنتج:", error)
    throw error
  }
}

export const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

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

    // إضافة المنتج إلى مخزون كل مركز توزيع
    const centers = await client.query("SELECT id FROM distribution_centers")
    for (const center of centers.rows) {
      await client.query(
        `
        INSERT INTO inventory (product_id, center_id, initial_quantity, current_quantity)
        VALUES ($1, $2, 0, 0)
        ON CONFLICT (product_id, center_id) DO NOTHING
      `,
        [productId, center.id],
      )
    }

    await client.query("COMMIT")

    return {
      id: productId.toString(),
      ...product,
    }
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("خطأ في إضافة المنتج:", error)
    throw error
  } finally {
    client.release()
  }
}

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    const currentProduct = await getProductById(id)
    if (!currentProduct) {
      throw new Error("المنتج غير موجود")
    }

    const updatedProduct = {
      ...currentProduct,
      ...product,
    }

    await pool.query(
      `
      UPDATE products
      SET name = $1, description = $2, price = $3, cost = $4, stock = $5, brand = $6, category = $7, image = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
    `,
      [
        updatedProduct.name,
        updatedProduct.description,
        updatedProduct.price,
        updatedProduct.cost,
        updatedProduct.stock,
        updatedProduct.brand,
        updatedProduct.category,
        updatedProduct.image,
        id,
      ],
    )

    return updatedProduct
  } catch (error) {
    console.error("خطأ في تحديث المنتج:", error)
    throw error
  }
}

export const deleteProduct = async (id: string): Promise<boolean> => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // حذف سجلات المخزون المرتبطة بالمنتج
    await client.query("DELETE FROM inventory WHERE product_id = $1", [id])

    // حذف سجلات المبيعات المرتبطة بالمنتج
    await client.query("DELETE FROM sales WHERE product_id = $1", [id])

    // حذف سجلات المخزون المرتبطة بالمنتج
    await client.query("DELETE FROM inventory_log WHERE product_id = $1", [id])

    // حذف المنتج
    const result = await client.query("DELETE FROM products WHERE id = $1", [id])

    await client.query("COMMIT")

    return (result.rowCount ?? 0) > 0
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("خطأ في حذف المنتج:", error)
    throw error
  } finally {
    client.release()
  }
}

export const updateProductStock = async (productId: string, quantity: number, isAddition = false): Promise<void> => {
  try {
    await pool.query(
      `
      UPDATE products
      SET stock = stock ${isAddition ? "+" : "-"} $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
      [quantity, productId],
    )
  } catch (error) {
    console.error("خطأ في تحديث مخزون المنتج:", error)
    throw error
  }
}

// دوال التعامل مع مراكز التوزيع
export const getDistributionCenters = async (): Promise<DistributionCenter[]> => {
  try {
    const result = await pool.query(`
      SELECT id, name, address, contact_person, phone, email, commission_rate
      FROM distribution_centers
      ORDER BY name
    `)

    return result.rows.map((row: any) => ({
      id: row.id.toString(),
      name: row.name,
      address: row.address || "",
      contactPerson: row.contact_person || "",
      phone: row.phone || "",
      email: row.email || "",
      commissionRate: Number.parseFloat(row.commission_rate),
    }))
  } catch (error) {
    console.error("خطأ في الحصول على مراكز التوزيع:", error)
    throw error
  }
}

export const getDistributionCenterById = async (id: string): Promise<DistributionCenter | null> => {
  try {
    const result = await pool.query(
      `
      SELECT id, name, address, contact_person, phone, email, commission_rate
      FROM distribution_centers
      WHERE id = $1
    `,
      [id],
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id.toString(),
      name: row.name,
      address: row.address || "",
      contactPerson: row.contact_person || "",
      phone: row.phone || "",
      email: row.email || "",
      commissionRate: Number.parseFloat(row.commission_rate),
    }
  } catch (error) {
    console.error("خطأ في الحصول على مركز التوزيع:", error)
    throw error
  }
}

export const addDistributionCenter = async (center: Omit<DistributionCenter, "id">): Promise<DistributionCenter> => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const result = await client.query(
      `
      INSERT INTO distribution_centers (name, address, contact_person, phone, email, commission_rate)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
      [center.name, center.address, center.contactPerson, center.phone, center.email, center.commissionRate],
    )

    const centerId = result.rows[0].id

    // إضافة جميع المنتجات إلى مخزون المركز الجديد
    const products = await client.query("SELECT id FROM products")
    for (const product of products.rows) {
      await client.query(
        `
        INSERT INTO inventory (product_id, center_id, initial_quantity, current_quantity)
        VALUES ($1, $2, 0, 0)
        ON CONFLICT (product_id, center_id) DO NOTHING
      `,
        [product.id, centerId],
      )
    }

    await client.query("COMMIT")

    return {
      id: centerId.toString(),
      ...center,
    }
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("خطأ في إضافة مركز التوزيع:", error)
    throw error
  } finally {
    client.release()
  }
}

export const updateDistributionCenter = async (
  id: string,
  center: Partial<DistributionCenter>,
): Promise<DistributionCenter> => {
  try {
    const currentCenter = await getDistributionCenterById(id)
    if (!currentCenter) {
      throw new Error("مركز التوزيع غير موجود")
    }

    const updatedCenter = {
      ...currentCenter,
      ...center,
    }

    await pool.query(
      `
      UPDATE distribution_centers
      SET name = $1, address = $2, contact_person = $3, phone = $4, email = $5, commission_rate = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `,
      [
        updatedCenter.name,
        updatedCenter.address,
        updatedCenter.contactPerson,
        updatedCenter.phone,
        updatedCenter.email,
        updatedCenter.commissionRate,
        id,
      ],
    )

    return updatedCenter
  } catch (error) {
    console.error("خطأ في تحديث مركز التوزيع:", error)
    throw error
  }
}

export const deleteDistributionCenter = async (id: string): Promise<boolean> => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // حذف سجلات المخزون المرتبطة بمركز التوزيع
    await client.query("DELETE FROM inventory WHERE center_id = $1", [id])

    // حذف سجلات المبيعات المرتبطة بمركز التوزيع
    await client.query("DELETE FROM sales WHERE center_id = $1", [id])

    // حذف سجلات المخزون المرتبطة بمركز التوزيع
    await client.query("DELETE FROM inventory_log WHERE center_id = $1", [id])

    // حذف مركز التوزيع
    const result = await client.query("DELETE FROM distribution_centers WHERE id = $1", [id])

    await client.query("COMMIT")

    return (result.rowCount ?? 0) > 0
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("خطأ في حذف مركز التوزيع:", error)
    throw error
  } finally {
    client.release()
  }
}

// دوال التعامل مع المبيعات
export const getSales = async (): Promise<Sale[]> => {
  try {
    const result = await pool.query(`
      SELECT id, product_id, center_id, quantity, price, sale_date
      FROM sales
      ORDER BY sale_date DESC
    `)

    return result.rows.map((row: any) => ({
      id: row.id.toString(),
      productId: row.product_id.toString(),
      centerId: row.center_id.toString(),
      quantity: row.quantity,
      price: Number.parseFloat(row.price),
      date: row.sale_date.toISOString(),
    }))
  } catch (error) {
    console.error("خطأ في الحصول على المبيعات:", error)
    throw error
  }
}

export const addSale = async (sale: Omit<Sale, "id">): Promise<Sale> => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // التحقق من توفر المخزون في مركز التوزيع
    const inventoryResult = await client.query(
      `
      SELECT current_quantity
      FROM inventory
      WHERE product_id = $1 AND center_id = $2
    `,
      [sale.productId, sale.centerId],
    )

    if (inventoryResult.rows.length === 0 || inventoryResult.rows[0].current_quantity < sale.quantity) {
      throw new Error("الكمية غير متوفرة في مركز التوزيع")
    }

    // إضافة عملية البيع
    const result = await client.query(
      `
      INSERT INTO sales (product_id, center_id, quantity, price, sale_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, sale_date
    `,
      [sale.productId, sale.centerId, sale.quantity, sale.price, sale.date ? new Date(sale.date) : new Date()],
    )

    const saleId = result.rows[0].id
    const saleDate = result.rows[0].sale_date

    // تحديث المخزون في مركز التوزيع
    await client.query(
      `
      UPDATE inventory
      SET current_quantity = current_quantity - $1, last_updated = CURRENT_TIMESTAMP
      WHERE product_id = $2 AND center_id = $3
    `,
      [sale.quantity, sale.productId, sale.centerId],
    )

    // تحديث مخزون المنتج
    await client.query(
      `
      UPDATE products
      SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
      [sale.quantity, sale.productId],
    )

    // إضافة سجل في سجل المخزون
    await client.query(
      `
      INSERT INTO inventory_log (product_id, center_id, quantity, operation_type, reason)
      VALUES ($1, $2, $3, 'sale', 'بيع')
    `,
      [sale.productId, sale.centerId, sale.quantity],
    )

    await client.query("COMMIT")

    return {
      id: saleId.toString(),
      productId: sale.productId,
      centerId: sale.centerId,
      quantity: sale.quantity,
      price: sale.price,
      date: saleDate.toISOString(),
    }
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("خطأ في إضافة عملية البيع:", error)
    throw error
  } finally {
    client.release()
  }
}

export const deleteSale = async (id: string): Promise<boolean> => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // الحصول على معلومات عملية البيع
    const saleResult = await client.query(
      `
      SELECT product_id, center_id, quantity
      FROM sales
      WHERE id = $1
    `,
      [id],
    )

    if (saleResult.rows.length === 0) {
      return false
    }

    const { product_id, center_id, quantity } = saleResult.rows[0]

    // إعادة الكمية إلى المخزون في مركز التوزيع
    await client.query(
      `
      UPDATE inventory
      SET current_quantity = current_quantity + $1, last_updated = CURRENT_TIMESTAMP
      WHERE product_id = $2 AND center_id = $3
    `,
      [quantity, product_id, center_id],
    )

    // إعادة الكمية إلى مخزون المنتج
    await client.query(
      `
      UPDATE products
      SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
      [quantity, product_id],
    )

    // إضافة سجل في سجل المخزون
    await client.query(
      `
      INSERT INTO inventory_log (product_id, center_id, quantity, operation_type, reason)
      VALUES ($1, $2, $3, 'return', 'إلغاء عملية بيع')
    `,
      [product_id, center_id, quantity],
    )

    // حذف عملية البيع
    const result = await client.query("DELETE FROM sales WHERE id = $1", [id])

    await client.query("COMMIT")

    return (result.rowCount ?? 0) > 0
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("خطأ في حذف عملية البيع:", error)
    throw error
  } finally {
    client.release()
  }
}

// دوال التعامل مع المخزون
export const getInventory = async (): Promise<ProductInventory[]> => {
  try {
    const result = await pool.query(`
      SELECT id, product_id, center_id, initial_quantity, current_quantity, last_updated
      FROM inventory
    `)

    return result.rows.map((row: any) => ({
      id: `${row.product_id}-${row.center_id}`,
      productId: row.product_id.toString(),
      centerId: row.center_id.toString(),
      initialQuantity: row.initial_quantity,
      currentQuantity: row.current_quantity,
      lastUpdated: row.last_updated.toISOString(),
    }))
  } catch (error) {
    console.error("خطأ في الحصول على المخزون:", error)
    throw error
  }
}

export const updateInventory = async (
  productId: string,
  centerId: string,
  quantity: number,
  isAddition = false,
  reason = "",
): Promise<void> => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    // تحديث المخزون في مركز التوزيع
    await client.query(
      `
      UPDATE inventory
      SET current_quantity = current_quantity ${isAddition ? "+" : "-"} $1, last_updated = CURRENT_TIMESTAMP
      WHERE product_id = $2 AND center_id = $3
    `,
      [quantity, productId, centerId],
    )

    // إضافة سجل في سجل المخزون
    await client.query(
      `
      INSERT INTO inventory_log (product_id, center_id, quantity, operation_type, reason)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [
        productId,
        centerId,
        quantity,
        isAddition ? "add" : "subtract",
        reason || (isAddition ? "إضافة مخزون" : "خصم مخزون"),
      ],
    )

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("خطأ في تحديث المخزون:", error)
    throw error
  } finally {
    client.release()
  }
}

// دوال التقارير
export const getProductInventoryReport = async (productId: string): Promise<any[]> => {
  try {
    const result = await pool.query(
      `
      SELECT i.product_id, i.center_id, i.initial_quantity, i.current_quantity, i.last_updated,
             c.name as center_name, c.address as center_address, c.contact_person as center_contact
      FROM inventory i
      JOIN distribution_centers c ON i.center_id = c.id
      WHERE i.product_id = $1
    `,
      [productId],
    )

    return result.rows.map((row: any) => ({
      id: `${row.product_id}-${row.center_id}`,
      productId: row.product_id.toString(),
      centerId: row.center_id.toString(),
      initialQuantity: row.initial_quantity,
      currentQuantity: row.current_quantity,
      lastUpdated: row.last_updated.toISOString(),
      centerName: row.center_name,
      centerAddress: row.center_address,
      centerContact: row.center_contact,
    }))
  } catch (error) {
    console.error("خطأ في الحصول على تقرير مخزون المنتج:", error)
    throw error
  }
}

export const getCenterInventoryReport = async (centerId: string): Promise<any[]> => {
  try {
    const result = await pool.query(
      `
      SELECT i.product_id, i.center_id, i.initial_quantity, i.current_quantity, i.last_updated,
             p.name as product_name, p.brand as product_brand, p.category as product_category, p.price as product_price
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.center_id = $1
    `,
      [centerId],
    )

    return result.rows.map((row: any) => ({
      id: `${row.product_id}-${row.center_id}`,
      productId: row.product_id.toString(),
      centerId: row.center_id.toString(),
      initialQuantity: row.initial_quantity,
      currentQuantity: row.current_quantity,
      lastUpdated: row.last_updated.toISOString(),
      productName: row.product_name,
      productBrand: row.product_brand,
      productCategory: row.product_category,
      productPrice: Number.parseFloat(row.product_price),
    }))
  } catch (error) {
    console.error("خطأ في الحصول على تقرير مخزون مركز التوزيع:", error)
    throw error
  }
}

export const getSalesByCenterReport = async (
  centerId: string,
  startDate?: string,
  endDate?: string,
): Promise<any[]> => {
  try {
    let query = `
      SELECT s.id, s.product_id, s.center_id, s.quantity, s.price, s.sale_date,
             p.name as product_name, p.brand as product_brand, p.category as product_category
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.center_id = $1
    `

    const params = [centerId]

    if (startDate && endDate) {
      query += ` AND s.sale_date BETWEEN $2 AND $3`
      params.push(startDate, endDate)
    }

    query += ` ORDER BY s.sale_date DESC`

    const result = await pool.query(query, params)

    return result.rows.map((row: any) => ({
      id: row.id.toString(),
      productId: row.product_id.toString(),
      centerId: row.center_id.toString(),
      quantity: row.quantity,
      price: Number.parseFloat(row.price),
      date: row.sale_date.toISOString(),
      productName: row.product_name,
      productBrand: row.product_brand,
      productCategory: row.product_category,
      totalAmount: row.quantity * Number.parseFloat(row.price),
    }))
  } catch (error) {
    console.error("خطأ في الحصول على تقرير مبيعات مركز التوزيع:", error)
    throw error
  }
}

export const getInventoryLog = async (productId?: string, centerId?: string): Promise<any[]> => {
  try {
    let query = `
      SELECT l.id, l.product_id, l.center_id, l.quantity, l.operation_type, l.reason, l.created_at,
             p.name as product_name, c.name as center_name
      FROM inventory_log l
      JOIN products p ON l.product_id = p.id
      JOIN distribution_centers c ON l.center_id = c.id
    `

    const params = []
    let paramIndex = 1

    if (productId || centerId) {
      query += ` WHERE`

      if (productId) {
        query += ` l.product_id = $${paramIndex}`
        params.push(productId)
        paramIndex++
      }

      if (productId && centerId) {
        query += ` AND`
      }

      if (centerId) {
        query += ` l.center_id = $${paramIndex}`
        params.push(centerId)
      }
    }

    query += ` ORDER BY l.created_at DESC`

    const result = await pool.query(query, params)

    return result.rows.map((row: any) => ({
      id: row.id.toString(),
      productId: row.product_id.toString(),
      centerId: row.center_id.toString(),
      quantity: row.quantity,
      operationType: row.operation_type,
      reason: row.reason,
      createdAt: row.created_at.toISOString(),
      productName: row.product_name,
      centerName: row.center_name,
    }))
  } catch (error) {
    console.error("خطأ في الحصول على سجل المخزون:", error)
    throw error
  }
}

// دوال إضافية
export const getProductsFromFile = async (): Promise<Product[]> => {
  try {
    // هذه الدالة تستخدم لاستيراد المنتجات من ملف
    // في هذه النسخة، سنقوم بإضافة بعض المنتجات الإضافية مباشرة
    const products = [
      {
        name: "مزيل عرق كريم أكوافايب برائحة الأطفال – 50غ",
        description: "مزيل عرق لطيف برائحة بودرة الأطفال، غني بمرطبات للبشرة، يوفر حماية تدوم 48 ساعة.",
        price: 45000,
        cost: 31500,
        stock: 80,
        brand: "Avon",
        category: "العناية الشخصية",
        image: "/images/135725.png",
      },
      {
        name: "مزيل عرق كريم أفون برائحة الأعشاب الحلوة – 50غ",
        description: "تركيبة غنية بخلاصة الأعشاب الحلوة، توفر حماية فعالة ضد التعرق وتترك رائحة طبيعية ومنعشة.",
        price: 45000,
        cost: 31500,
        stock: 70,
        brand: "Avon",
        category: "العناية الشخصية",
        image: "/images/135726.png",
      },
      {
        name: "مزيل عرق كريم فار أواي سبلندوريا – أكسل",
        description: "مزيل عرق برائحة فاخرة من مجموعة Far Away، يمنح حماية تدوم 48 ساعة وعطرًا يدوم طويلاً.",
        price: 45000,
        cost: 31500,
        stock: 60,
        brand: "Avon",
        category: "العناية الشخصية",
        image: "/images/177792.png",
      },
    ]

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const addedProducts = []

      for (const product of products) {
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

        // إضافة المنتج إلى مخزون كل مركز توزيع
        const centers = await client.query("SELECT id FROM distribution_centers")
        for (const center of centers.rows) {
          const quantity = Math.floor(Math.random() * 20) + 5 // كمية عشوائية بين 5-25
          await client.query(
            `
            INSERT INTO inventory (product_id, center_id, initial_quantity, current_quantity)
            VALUES ($1, $2, $3, $3)
            ON CONFLICT (product_id, center_id) DO NOTHING
          `,
            [productId, center.id, quantity],
          )
        }

        addedProducts.push({
          id: productId.toString(),
          ...product,
        })
      }

      await client.query("COMMIT")

      return addedProducts
    } catch (error) {
      await client.query("ROLLBACK")
      console.error("خطأ في استيراد المنتجات:", error)
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("خطأ في استيراد المنتجات:", error)
    throw error
  }
}

// دوال التقارير المخصصة
export const getCustomReports = async (): Promise<CustomReport[]> => {
  try {
    const result = await pool.query(
      `SELECT id, name, type, columns, filters FROM custom_reports ORDER BY id`
    )
    return result.rows.map((row: any) => ({
      id: row.id.toString(),
      name: row.name,
      type: row.type,
      columns: row.columns || [],
      filters: row.filters || {},
    }))
  } catch (error) {
    console.error("خطأ في الحصول على التقارير المخصصة:", error)
    throw error
  }
}

export const addCustomReport = async (
  report: Omit<CustomReport, "id">,
): Promise<CustomReport> => {
  try {
    const result = await pool.query(
      `
      INSERT INTO custom_reports (name, type, columns, filters)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
      [report.name, report.type, report.columns, report.filters || null],
    )
    const id = result.rows[0].id.toString()
    return { id, ...report }
  } catch (error) {
    console.error("خطأ في إضافة التقرير المخصص:", error)
    throw error
  }
}

export const deleteCustomReport = async (id: string): Promise<boolean> => {
  try {
    const result = await pool.query(
      `DELETE FROM custom_reports WHERE id = $1`,
      [id],
    )
    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.error("خطأ في حذف التقرير المخصص:", error)
    throw error
  }
}

export interface User {
  id: string
  username: string
  passwordHash: string
}

export const getUserByUsername = async (
  username: string,
): Promise<User | null> => {
  try {
    const result = await pool.query(
      `SELECT id, username, password_hash FROM users WHERE username = $1`,
      [username],
    )
    if (result.rows.length === 0) return null
    const row = result.rows[0]
    return {
      id: row.id.toString(),
      username: row.username,
      passwordHash: row.password_hash,
    }
  } catch (error) {
    console.error("خطأ في جلب المستخدم:", error)
    throw error
  }
}

export const createUser = async (
  username: string,
  password: string,
): Promise<User> => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const hash = await hashPassword(password)
    const result = await client.query(
      `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id`,
      [username, hash],
    )
    await client.query("COMMIT")
    const id = result.rows[0].id.toString()
    return { id, username, passwordHash: hash }
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("خطأ في إنشاء المستخدم:", error)
    throw error
  } finally {
    client.release()
  }
}

if (require.main === module) {
  (async () => {
    try {
      await testConnection()
      await initializeDatabase()
      await seedDatabase()
      console.log('Database ready')
    } catch (err) {
      console.error('Database initialization failed:', err)
      process.exit(1)
    } finally {
      await pool.end()
    }
  })()
}
