import type {
  Product,
  DistributionCenter,
  Sale,
  ProductInventory,
  CustomReport,
} from "./types"

// Local Storage Keys
const PRODUCTS_KEY = "accounting_products"
const CENTERS_KEY = "accounting_centers"
const SALES_KEY = "accounting_sales"
const INVENTORY_KEY = "accounting_inventory"

// معدل تحويل الريال البرازيلي إلى الدولار الأمريكي (تقريبي)
const BRL_TO_USD = 0.2
// معدل تحويل الدولار الأمريكي إلى الليرة السورية
const USD_TO_SYP = 11000
// نسبة الربح للبائع
const SELLER_PROFIT_PERCENTAGE = 0.03

// دالة مساعدة للتعامل مع localStorage بشكل آمن
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error)
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error)
    }
  },
}

// تحويل السعر من الريال البرازيلي إلى الليرة السورية مع إضافة نسبة الربح
export const convertPrice = (priceInBRL: number): number => {
  // تحويل من الريال البرازيلي إلى الدولار
  const priceInUSD = priceInBRL * BRL_TO_USD
  // تحويل من الدولار إلى الليرة السورية
  const priceInSYP = priceInUSD * USD_TO_SYP
  // إضافة نسبة الربح
  const finalPrice = priceInSYP * (1 + SELLER_PROFIT_PERCENTAGE)
  // تقريب السعر
  return Math.round(finalPrice)
}

// Initialize data with sample data if not exists
export const initializeData = () => {
  try {
    if (!safeLocalStorage.getItem(PRODUCTS_KEY)) {
      const sampleProducts: Product[] = [
        {
          id: "1",
          name: "مزيل عرق كريم أفون للنساء بدون عطر – 50غ",
          description: "تركيبة لطيفة وخالية من العطور، تحمي من التعرق وتناسب البشرة الحساسة دون التسبب في التهيج.",
          price: convertPrice(4.1),
          cost: convertPrice(4.1) * 0.7, // التكلفة تقدر بـ 70% من سعر البيع
          stock: 100,
          brand: "Avon",
          category: "العناية الشخصية",
          image: "images/135727.png",
        },
        {
          id: "2",
          name: "كريم أفون كير لليدين بالسيليكون – 75غ",
          description: "يحتوي على السيليكون الذي يشكل طبقة واقية على اليدين، يحمي من الجفاف ويمنح ترطيبًا عميقًا.",
          price: convertPrice(6.45),
          cost: convertPrice(6.45) * 0.7,
          stock: 50,
          brand: "Avon",
          category: "عناية باليدين",
          image: "images/161063.png",
        },
        {
          id: "3",
          name: "كريم الوجه النهاري أفون كير بالفيتامينات المتعددة – 100غ",
          description:
            "يحتوي على مزيج من الفيتامينات A، C، و E، يمنح البشرة إشراقًا وترطيبًا مع حماية خفيفة من العوامل البيئية.",
          price: convertPrice(10.79),
          cost: convertPrice(10.79) * 0.7,
          stock: 75,
          brand: "Avon",
          category: "عناية بالبشرة",
          image: "images/152724.png",
        },
      ]
      saveProducts(sampleProducts)
    }

    if (!safeLocalStorage.getItem(CENTERS_KEY)) {
      const sampleCenters: DistributionCenter[] = [
        {
          id: "1",
          name: "صيدلية الشفاء",
          address: "شارع الرئيسي، دمشق",
          contactPerson: "أحمد محمد",
          phone: "0911234567",
          email: "ahmed@example.com",
          commissionRate: 10,
        },
        {
          id: "2",
          name: "صيدلية الرحمة",
          address: "شارع الجلاء، حلب",
          contactPerson: "سارة خالد",
          phone: "0921234567",
          email: "sara@example.com",
          commissionRate: 12,
        },
      ]
      saveDistributionCenters(sampleCenters)
    }

    if (!safeLocalStorage.getItem(SALES_KEY)) {
      const sampleSales: Sale[] = [
        {
          id: "1",
          productId: "1",
          centerId: "1",
          quantity: 10,
          price: convertPrice(4.1),
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        },
        {
          id: "2",
          productId: "2",
          centerId: "1",
          quantity: 5,
          price: convertPrice(6.45),
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        },
        {
          id: "3",
          productId: "3",
          centerId: "2",
          quantity: 8,
          price: convertPrice(10.79),
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
      ]
      saveSales(sampleSales)
    }

    // تهيئة بيانات المخزون في مراكز التوزيع
    if (!safeLocalStorage.getItem(INVENTORY_KEY)) {
      const products = getProducts()
      const centers = getDistributionCenters()

      const sampleInventory: ProductInventory[] = []

      // إنشاء سجلات مخزون لكل منتج في كل مركز توزيع
      products.forEach((product) => {
        centers.forEach((center) => {
          // توزيع المخزون بشكل عشوائي بين مراكز التوزيع
          const quantity = Math.floor(Math.random() * 20) + 5 // كمية عشوائية بين 5-25

          sampleInventory.push({
            id: `${product.id}-${center.id}`,
            productId: product.id,
            centerId: center.id,
            initialQuantity: quantity,
            currentQuantity: quantity,
            lastUpdated: new Date().toISOString(),
          })
        })
      })

      saveInventory(sampleInventory)
    }
  } catch (error) {
    console.error("Error initializing data:", error)
  }
}

// Products
export const getProducts = (): Product[] => {
  try {
    const productsJson = safeLocalStorage.getItem(PRODUCTS_KEY)
    return productsJson ? JSON.parse(productsJson) : []
  } catch (error) {
    console.error("Error parsing products from localStorage:", error)
    return []
  }
}

export const saveProducts = (products: Product[]) => {
  try {
    safeLocalStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  } catch (error) {
    console.error("Error saving products to localStorage:", error)
  }
}

export const updateProductStock = (productId: string, quantity: number) => {
  try {
    const products = getProducts()
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return {
          ...product,
          stock: product.stock - quantity,
        }
      }
      return product
    })
    saveProducts(updatedProducts)
  } catch (error) {
    console.error("Error updating product stock:", error)
  }
}

// Distribution Centers
export const getDistributionCenters = (): DistributionCenter[] => {
  try {
    const centersJson = safeLocalStorage.getItem(CENTERS_KEY)
    return centersJson ? JSON.parse(centersJson) : []
  } catch (error) {
    console.error("Error parsing distribution centers from localStorage:", error)
    return []
  }
}

export const saveDistributionCenters = (centers: DistributionCenter[]) => {
  try {
    safeLocalStorage.setItem(CENTERS_KEY, JSON.stringify(centers))
  } catch (error) {
    console.error("Error saving distribution centers to localStorage:", error)
  }
}

// Sales
export const getSales = (): Sale[] => {
  try {
    const salesJson = safeLocalStorage.getItem(SALES_KEY)
    return salesJson ? JSON.parse(salesJson) : []
  } catch (error) {
    console.error("Error parsing sales from localStorage:", error)
    return []
  }
}

export const saveSales = (sales: Sale[]) => {
  try {
    safeLocalStorage.setItem(SALES_KEY, JSON.stringify(sales))
  } catch (error) {
    console.error("Error saving sales to localStorage:", error)
  }
}

// Inventory Management
export const getInventory = (): ProductInventory[] => {
  try {
    const inventoryJson = safeLocalStorage.getItem(INVENTORY_KEY)
    return inventoryJson ? JSON.parse(inventoryJson) : []
  } catch (error) {
    console.error("Error parsing inventory from localStorage:", error)
    return []
  }
}

export const saveInventory = (inventory: ProductInventory[]) => {
  try {
    safeLocalStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory))
  } catch (error) {
    console.error("Error saving inventory to localStorage:", error)
  }
}

export const updateInventory = (productId: string, centerId: string, quantity: number, isAddition = false) => {
  try {
    const inventory = getInventory()
    const inventoryItem = inventory.find((item) => item.productId === productId && item.centerId === centerId)

    if (inventoryItem) {
      const updatedInventory = inventory.map((item) => {
        if (item.productId === productId && item.centerId === centerId) {
          return {
            ...item,
            currentQuantity: isAddition ? item.currentQuantity + quantity : item.currentQuantity - quantity,
            lastUpdated: new Date().toISOString(),
          }
        }
        return item
      })
      saveInventory(updatedInventory)
    } else {
      // إذا لم يكن المنتج موجودًا في المخزون، أضفه
      const newInventoryItem: ProductInventory = {
        id: `${productId}-${centerId}`,
        productId,
        centerId,
        initialQuantity: quantity,
        currentQuantity: quantity,
        lastUpdated: new Date().toISOString(),
      }
      saveInventory([...inventory, newInventoryItem])
    }
  } catch (error) {
    console.error("Error updating inventory:", error)
  }
}

// تقارير المخزون
export const getProductInventoryReport = (productId: string) => {
  try {
    const inventory = getInventory()
    const centers = getDistributionCenters()

    // الحصول على سجلات المخزون للمنتج المحدد
    const productInventory = inventory.filter((item) => item.productId === productId)

    // إضافة معلومات مركز التوزيع لكل سجل
    return productInventory.map((item) => {
      const center = centers.find((c) => c.id === item.centerId)
      return {
        ...item,
        centerName: center?.name || "Unknown",
        centerAddress: center?.address || "",
        centerContact: center?.contactPerson || "",
      }
    })
  } catch (error) {
    console.error("Error generating product inventory report:", error)
    return []
  }
}

export const getCenterInventoryReport = (centerId: string) => {
  try {
    const inventory = getInventory()
    const products = getProducts()

    // الحصول على سجلات المخزون لمركز التوزيع المحدد
    const centerInventory = inventory.filter((item) => item.centerId === centerId)

    // إضافة معلومات المنتج لكل سجل
    return centerInventory.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return {
        ...item,
        productName: product?.name || "Unknown",
        productBrand: product?.brand || "",
        productCategory: product?.category || "",
        productPrice: product?.price || 0,
      }
    })
  } catch (error) {
    console.error("Error generating center inventory report:", error)
    return []
  }
}

export const getSalesByCenterReport = (centerId: string, startDate?: string, endDate?: string) => {
  try {
    const sales = getSales()
    const products = getProducts()

    // تصفية المبيعات حسب مركز التوزيع
    let centerSales = sales.filter((sale) => sale.centerId === centerId)

    // تصفية حسب التاريخ إذا تم تحديده
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // تعيين إلى نهاية اليوم

      centerSales = centerSales.filter((sale) => {
        const saleDate = new Date(sale.date)
        return saleDate >= start && saleDate <= end
      })
    }

    // إضافة معلومات المنتج لكل سجل مبيعات
    return centerSales
      .map((sale) => {
        const product = products.find((p) => p.id === sale.productId)
        return {
          ...sale,
          productName: product?.name || "Unknown",
          productBrand: product?.brand || "",
          productCategory: product?.category || "",
          totalAmount: sale.quantity * sale.price,
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // ترتيب حسب التاريخ (الأحدث أولاً)
  } catch (error) {
    console.error("Error generating sales by center report:", error)
    return []
  }
}

// Import products from file
export const getProductsFromFile = (): Product[] => {
  try {
    // This is a simplified version that would normally fetch from an API
    // For this demo, we'll use the products array from the provided JS file
    const products = [
      {
        name: "مزيل عرق كريم أفون للنساء بدون عطر – 50غ",
        brand: "Avon",
        line: "AVON DESODORANTE",
        category: "العناية الشخصية",
        description: "تركيبة لطيفة وخالية من العطور، تحمي من التعرق وتناسب البشرة الحساسة دون التسبب في التهيج.",
        usage: "يُستخدم يوميًا تحت الإبطين على بشرة نظيفة وجافة.",
        explanation: "يوفر حماية فعالة ويمنح شعوراً بالنظافة دون تغطية برائحة.",
        image: "images/135727.png",
        name_pt: "AVON DESOD CREME SEM PERFUM FEM 50G",
        price: 4.1,
      },
      {
        name: "مزيل عرق كريم أكوافايب برائحة الأطفال – 50غ",
        brand: "Avon",
        line: "AVON DESODORANTE",
        category: "العناية الشخصية",
        description: "مزيل عرق لطيف برائحة بودرة الأطفال، غني بمرطبات للبشرة، يوفر حماية تدوم 48 ساعة.",
        usage: "يوضع على بشرة نظيفة وجافة تحت الإبط.",
        explanation: "مناسب للبشرة الحساسة، لا يسبب التهيج ويمتص بسرعة دون أن يترك بقايا.",
        image: "images/135725.png",
        name_pt: "AQUAVIBE DESODORANTE CREME BABY SMEL 50G",
        price: 4.1,
      },
      {
        name: "مزيل عرق كريم أفون برائحة الأعشاب الحلوة – 50غ",
        brand: "Avon",
        line: "AVON DESODORANTE",
        category: "العناية الشخصية",
        description: "تركيبة غنية بخلاصة الأعشاب الحلوة، توفر حماية فعالة ضد التعرق وتترك رائحة طبيعية ومنعشة.",
        usage: "يُستخدم يوميًا على بشرة نظيفة وجافة.",
        explanation: "يمنح راحة وثقة طوال اليوم مع ترطيب خفيف وعطر منعش يدوم.",
        image: "images/135726.png",
        name_pt: "AVON DESODE CREME ERVA DOCE 50G",
        price: 4.1,
      },
      {
        name: "مزيل عرق كريم فار أواي سبلندوريا – أكسل",
        brand: "Avon",
        line: "AVON DESODORANTE",
        category: "العناية الشخصية",
        description: "مزيل عرق برائحة فاخرة من مجموعة Far Away، يمنح حماية تدوم 48 ساعة وعطرًا يدوم طويلاً.",
        usage: "يُستخدم يوميًا على بشرة نظيفة وجافة تحت الإبط.",
        explanation: "يجمع بين الأناقة والحماية، يمنح إحساسًا بالانتعاش مع لمسة عطرية ساحرة.",
        image: "images/177792.png",
        name_pt: "FAR AWAY SPLENDORIA DESOD CREME AXL",
        price: 4.1,
      },
      {
        name: "مزيل عرق كريم فار أواي أورجينال – أكسل",
        brand: "Avon",
        line: "AVON DESODORANTE",
        category: "العناية الشخصية",
        description: "نفس العطر الكلاسيكي الشهير من Far Away بتركيبة مزيل عرق ناعمة وفعالة.",
        usage: "يُستخدم يوميًا.",
        explanation: "مثالي للنساء الباحثات عن حماية يومية برائحة أنثوية تقليدية من أفون.",
        image: "images/177793.png",
        name_pt: "FAR AWAY ORIGINAL DESOD CREME AXL",
        price: 4.1,
      },
      {
        name: "مزيل عرق كريم فار أواي غلامور – أكسل",
        brand: "Avon",
        line: "AVON DESODORANTE",
        category: "العناية الشخصية",
        description: 'تركيبة منعشة برائحة "Glamour" الجريئة والمميزة، مع حماية من الرطوبة والتعرق.',
        usage: "يُوضع على الإبطين النظيفين.",
        explanation: "حماية تدوم طويلاً بعطر أنيق يضيف لمسة من التألق والثقة.",
        image: "images/179546.png",
        name_pt: "FAR AWAY GLAMOUR¿DESOD CREME AXL",
        price: 4.718,
      },
      {
        name: "كريم أفون كير لليدين بالسيليكون – 75غ",
        brand: "Avon",
        line: "AVON CARE",
        category: "عناية باليدين",
        description: "يحتوي على السيليكون الذي يشكل طبقة واقية على اليدين، يحمي من الجفاف ويمنح ترطيبًا عميقًا.",
        usage: "يُستخدم على اليدين عدة مرات يومياً حسب الحاجة.",
        explanation: "يرطب ويحمي اليدين من العوامل الخارجية مع ملمس غير دهني.",
        image: "images/161063.png",
        name_pt: "AVON CARE CR DES MAO SILICONE 75G",
        price: 6.45,
      },
      {
        name: "كريم أفون كير لليدين بالسيليكون والمكاديميا – 75غ",
        brand: "Avon",
        line: "AVON CARE",
        category: "عناية باليدين",
        description: "تركيبة تجمع بين السيليكون المغلف والزيت الطبيعي من المكاديميا لترطيب يدوم طويلًا.",
        usage: "يُستخدم على اليدين النظيفة ويدلك حتى الامتصاص.",
        explanation: "يغذي البشرة بعمق ويحسن من مرونتها مع حماية فعالة من الجفاف.",
        image: "images/161079.png",
        name_pt: "AVON CARE CR DES MAO SILIC MACADAMIA 75G",
        price: 6.45,
      },
      {
        name: "كريم أفون فُت وركس لترطيب القدمين المكثف – 80غ",
        brand: "Avon",
        line: "AVON CARE",
        category: "عناية بالقدمين",
        description: "تركيبة غنية بزبدة الشيا ومضادات البكتيريا، يرطب الكعبين المتشققين ويهدئ التعب.",
        usage: "يُوضع على القدمين النظيفة مع تدليك حتى الامتصاص.",
        explanation: "يمنح راحة فورية للقدمين ويُستخدم يومياً للعناية المستمرة.",
        image: "images/174931.png",
        name_pt: "FOOTWORKS HID DES PES INTENSIVA 80G",
        price: 10.55,
      },
      {
        name: "كريم الوجه الليلي أفون كير – ليلة سعيدة – 100غ",
        brand: "Avon",
        line: "AVON CARE",
        category: "عناية بالبشرة",
        description: "يحتوي على البانثينول ومغذيات الليل التي تعمل أثناء النوم لتغذية البشرة وتجديدها.",
        usage: "يوضع ليلاً بعد تنظيف البشرة.",
        explanation: "يعزز تجدد البشرة أثناء النوم ويمنحها مظهراً منتعشاً عند الاستيقاظ.",
        image: "images/136026.png",
        name_pt: "AVON CARE CREME FAC BOA NOITE 100G",
        price: 10.79,
      },
      {
        name: "كريم الوجه النهاري أفون كير بالفيتامينات المتعددة – 100غ",
        brand: "Avon",
        line: "AVON CARE",
        category: "عناية بالبشرة",
        description:
          "يحتوي على مزيج من الفيتامينات A، C، و E، يمنح البشرة إشراقًا وترطيبًا مع حماية خفيفة من العوامل البيئية.",
        usage: "يوضع صباحًا على الوجه والرقبة.",
        explanation: "مثالي للبشرة الباهتة، يعزز الحيوية والترطيب مع الاستخدام اليومي.",
        image: "images/152724.png",
        name_pt: "AVON CARE MULTIVITAMIN CREME DIA 100G",
        price: 10.79,
      },
    ]

    // تحويل الأسعار وإضافة معرفات للمنتجات
    const importedProducts = products.map((product, index) => ({
      ...product,
      id: (index + 1).toString(),
      price: convertPrice(product.price),
      cost: convertPrice(product.price) * 0.7, // التكلفة تقدر بـ 70% من سعر البيع
      stock: Math.floor(Math.random() * 100) + 10, // كمية عشوائية بين 10-110
    }))

    // تهيئة مخزون المنتجات في مراكز التوزيع
    const centers = getDistributionCenters()
    const inventory = getInventory()

    // إنشاء سجلات مخزون للمنتجات الجديدة
    const newInventoryItems: ProductInventory[] = []

    importedProducts.forEach((product) => {
      centers.forEach((center) => {
        // التحقق مما إذا كان المنتج موجودًا بالفعل في المخزون
        const existingItem = inventory.find((item) => item.productId === product.id && item.centerId === center.id)

        if (!existingItem) {
          // توزيع المخزون بشكل عشوائي بين مراكز التوزيع
          const quantity = Math.floor(Math.random() * 20) + 5 // كمية عشوائية بين 5-25

          newInventoryItems.push({
            id: `${product.id}-${center.id}`,
            productId: product.id,
            centerId: center.id,
            initialQuantity: quantity,
            currentQuantity: quantity,
            lastUpdated: new Date().toISOString(),
          })
        }
      })
    })

    // حفظ سجلات المخزون الجديدة
    if (newInventoryItems.length > 0) {
      saveInventory([...inventory, ...newInventoryItems])
    }

    return importedProducts
  } catch (error) {
    console.error("Error importing products:", error)
    return []
  }
}

// Custom Reports
const CUSTOM_REPORTS_KEY = "accounting_custom_reports"

export const getCustomReports = (): CustomReport[] => {
  try {
    const json = safeLocalStorage.getItem(CUSTOM_REPORTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error loading custom reports:", error);
    return [];
  }
};

export const saveCustomReports = (reports: CustomReport[]) => {
  try {
    safeLocalStorage.setItem(CUSTOM_REPORTS_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error("Error saving custom reports:", error);
  }
};

export const addCustomReport = (report: Omit<CustomReport, "id">): CustomReport => {
  const reports = getCustomReports();
  const newReport: CustomReport = { ...report, id: Date.now().toString() };
  saveCustomReports([...reports, newReport]);
  return newReport;
};

export const updateCustomReport = (id: string, report: Partial<CustomReport>): CustomReport | null => {
  const reports = getCustomReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) return null;
  reports[index] = { ...reports[index], ...report };
  saveCustomReports(reports);
  return reports[index];
};

export const deleteCustomReport = (id: string): void => {
  const reports = getCustomReports().filter((r) => r.id !== id);
  saveCustomReports(reports);
};
