import type { Product, DistributionCenter, Sale, ProductInventory, InventoryLog } from "./types"

const API_BASE_URL = "/api"

// دوال التعامل مع المنتجات
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    if (!response.ok) {
      throw new Error("فشل في الحصول على المنتجات")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في الحصول على المنتجات:", error)
    throw error
  }
}

export const fetchProductById = async (id: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`)
    if (!response.ok) {
      throw new Error("فشل في الحصول على المنتج")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في الحصول على المنتج:", error)
    throw error
  }
}

export const addProductApi = async (product: Omit<Product, "id">): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })
    if (!response.ok) {
      throw new Error("فشل في إضافة المنتج")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في إضافة المنتج:", error)
    throw error
  }
}

export const updateProductApi = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })
    if (!response.ok) {
      throw new Error("فشل في تحديث المنتج")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في تحديث المنتج:", error)
    throw error
  }
}

export const deleteProductApi = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("فشل في حذف المنتج")
    }
    return true
  } catch (error) {
    console.error("خطأ في حذف المنتج:", error)
    throw error
  }
}

export const importProductsApi = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/import-products`)
    if (!response.ok) {
      throw new Error("فشل في استيراد المنتجات")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في استيراد المنتجات:", error)
    throw error
  }
}

// دوال التعامل مع مراكز التوزيع
export const fetchDistributionCenters = async (): Promise<DistributionCenter[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/centers`)
    if (!response.ok) {
      throw new Error("فشل في الحصول على مراكز التوزيع")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في الحصول على مراكز التوزيع:", error)
    throw error
  }
}

export const fetchDistributionCenterById = async (id: string): Promise<DistributionCenter> => {
  try {
    const response = await fetch(`${API_BASE_URL}/centers/${id}`)
    if (!response.ok) {
      throw new Error("فشل في الحصول على مركز التوزيع")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في الحصول على مركز التوزيع:", error)
    throw error
  }
}

export const addDistributionCenterApi = async (center: Omit<DistributionCenter, "id">): Promise<DistributionCenter> => {
  try {
    const response = await fetch(`${API_BASE_URL}/centers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(center),
    })
    if (!response.ok) {
      throw new Error("فشل في إضافة مركز التوزيع")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في إضافة مركز التوزيع:", error)
    throw error
  }
}

export const updateDistributionCenterApi = async (
  id: string,
  center: Partial<DistributionCenter>,
): Promise<DistributionCenter> => {
  try {
    const response = await fetch(`${API_BASE_URL}/centers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(center),
    })
    if (!response.ok) {
      throw new Error("فشل في تحديث مركز التوزيع")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في تحديث مركز التوزيع:", error)
    throw error
  }
}

export const deleteDistributionCenterApi = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/centers/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("فشل في حذف مركز التوزيع")
    }
    return true
  } catch (error) {
    console.error("خطأ في حذف مركز التوزيع:", error)
    throw error
  }
}

// دوال التعامل مع المبيعات
export const fetchSales = async (): Promise<Sale[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sales`)
    if (!response.ok) {
      throw new Error("فشل في الحصول على المبيعات")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في الحصول على المبيعات:", error)
    throw error
  }
}

export const addSaleApi = async (sale: Omit<Sale, "id">): Promise<Sale> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sale),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "فشل في إضافة عملية البيع")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في إضافة عملية البيع:", error)
    throw error
  }
}

export const deleteSaleApi = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/sales?id=${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("فشل في حذف عملية البيع")
    }
    return true
  } catch (error) {
    console.error("خطأ في حذف عملية البيع:", error)
    throw error
  }
}

// دوال التعامل مع المخزون
export const fetchInventory = async (): Promise<ProductInventory[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`)
    if (!response.ok) {
      throw new Error("فشل في الحصول على المخزون")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في الحصول على المخزون:", error)
    throw error
  }
}

export const updateInventoryApi = async (
  productId: string,
  centerId: string,
  quantity: number,
  isAddition: boolean,
  reason: string,
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        centerId,
        quantity,
        isAddition,
        reason,
      }),
    })
    if (!response.ok) {
      throw new Error("فشل في تحديث المخزون")
    }
  } catch (error) {
    console.error("خطأ في تحديث المخزون:", error)
    throw error
  }
}

// دوال التقارير
export const fetchProductInventoryReport = async (productId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/product-inventory/${productId}`)
    if (!response.ok) {
      throw new Error("فشل في الحصول على تقرير مخزون المنتج")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في الحصول على تقرير مخزون المنتج:", error)
    throw error
  }
}

export const fetchCenterInventoryReport = async (centerId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/center-inventory/${centerId}`)
    if (!response.ok) {
      throw new Error("فشل في الحصول على تقرير مخزون مركز التوزيع")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في الحصول على تقرير مخزون مركز التوزيع:", error)
    throw error
  }
}

export const fetchCenterSalesReport = async (
  centerId: string,
  startDate?: string,
  endDate?: string,
): Promise<any[]> => {
  try {
    let url = `${API_BASE_URL}/reports/center-sales/${centerId}`
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`
    }
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("فشل في الحصول على تقرير مبيعات مركز التوزيع")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في الحصول على تقرير مبيعات مركز التوزيع:", error)
    throw error
  }
}

export const fetchInventoryLog = async (productId?: string, centerId?: string): Promise<InventoryLog[]> => {
  try {
    let url = `${API_BASE_URL}/reports/inventory-log`
    const params = new URLSearchParams()
    if (productId) params.append("productId", productId)
    if (centerId) params.append("centerId", centerId)
    if (params.toString()) url += `?${params.toString()}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error("فشل في الحصول على سجل المخزون")
    }
    return await response.json()
  } catch (error) {
    console.error("خطأ في الحصول على سجل المخزون:", error)
    throw error
  }
}

// دالة تهيئة قاعدة البيانات
export const initializeDb = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/init-db`)
    if (!response.ok) {
      throw new Error("فشل في تهيئة قاعدة البيانات")
    }
    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("خطأ في تهيئة قاعدة البيانات:", error)
    throw error
  }
}
