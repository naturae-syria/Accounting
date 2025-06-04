export interface Product {
  id: string
  name: string
  description: string
  price: number
  cost: number
  stock: number
  brand?: string
  category?: string
  image?: string
  line?: string
  usage?: string
  explanation?: string
  name_pt?: string
}

export interface DistributionCenter {
  id: string
  name: string
  address: string
  contactPerson: string
  phone: string
  email: string
  commissionRate: number
}

export interface Sale {
  id: string
  productId: string
  centerId: string
  quantity: number
  price: number
  date: string
}

export interface ProductInventory {
  id: string
  productId: string
  centerId: string
  initialQuantity: number
  currentQuantity: number
  lastUpdated: string
}

export interface InventoryLog {
  id: string
  productId: string
  centerId: string
  quantity: number
  operationType: "add" | "subtract" | "sale" | "return"
  reason: string
  createdAt: string
  productName?: string
  centerName?: string
}
