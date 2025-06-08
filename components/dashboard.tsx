"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { getProducts, getDistributionCenters, getSales } from "@/lib/data-utils"
import type { Product, DistributionCenter, Sale } from "@/lib/types"

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [centers, setCenters] = useState<DistributionCenter[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalCommission, setTotalCommission] = useState(0)
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [centerPerformance, setCenterPerformance] = useState<any[]>([])

  useEffect(() => {
    const loadData = () => {
      const productsData = getProducts()
      const centersData = getDistributionCenters()
      const salesData = getSales()

      setProducts(productsData)
      setCenters(centersData)
      setSales(salesData)

      // Calculate total revenue and commission
      let revenue = 0
      let commission = 0

      salesData.forEach((sale) => {
        revenue += sale.quantity * sale.price
        commission += sale.quantity * sale.price * 0.1 // Assuming 10% commission
      })

      setTotalRevenue(revenue)
      setTotalCommission(commission)

      // Calculate top products
      const productSales: Record<string, { quantity: number; revenue: number }> = {}

      salesData.forEach((sale) => {
        if (!productSales[sale.productId]) {
          productSales[sale.productId] = { quantity: 0, revenue: 0 }
        }
        productSales[sale.productId].quantity += sale.quantity
        productSales[sale.productId].revenue += sale.quantity * sale.price
      })

      const topProductsData = Object.entries(productSales)
        .map(([productId, data]) => {
          const product = productsData.find((p) => p.id === productId)
          return {
            name: product?.name || "غير معروف",
            quantity: data.quantity,
            revenue: data.revenue,
          }
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      setTopProducts(topProductsData)

      // Calculate center performance
      const centerSales: Record<string, { quantity: number; revenue: number }> = {}

      salesData.forEach((sale) => {
        if (!centerSales[sale.centerId]) {
          centerSales[sale.centerId] = { quantity: 0, revenue: 0 }
        }
        centerSales[sale.centerId].quantity += sale.quantity
        centerSales[sale.centerId].revenue += sale.quantity * sale.price
      })

      const centerPerformanceData = Object.entries(centerSales).map(([centerId, data]) => {
        const center = centersData.find((c) => c.id === centerId)
        return {
          name: center?.name || "غير معروف",
          revenue: data.revenue,
        }
      })

      setCenterPerformance(centerPerformanceData)
    }

    loadData()

    // Set up interval to refresh data every 5 seconds
    const interval = setInterval(loadData, 5000)

    return () => clearInterval(interval)
  }, [])

  const COLORS = ["#f97316", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
      <Card className="bg-background shadow-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary">إجمالي المبيعات</CardTitle>
          <CardDescription>إجمالي قيمة المبيعات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} ل.س</div>
        </CardContent>
      </Card>

      <Card className="bg-background shadow-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary">إجمالي العمولة</CardTitle>
          <CardDescription>إجمالي قيمة العمولات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCommission.toLocaleString()} ل.س</div>
        </CardContent>
      </Card>

      <Card className="bg-background shadow-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary">إحصائيات عامة</CardTitle>
          <CardDescription>أعداد المنتجات والمراكز والمبيعات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>عدد المنتجات:</span>
              <span className="font-bold">{products.length}</span>
            </div>
            <div className="flex justify-between">
              <span>عدد مراكز التوزيع:</span>
              <span className="font-bold">{centers.length}</span>
            </div>
            <div className="flex justify-between">
              <span>عدد عمليات البيع:</span>
              <span className="font-bold">{sales.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-1 bg-background shadow-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary">أفضل المنتجات مبيعاً</CardTitle>
          <CardDescription>المنتجات الأكثر مبيعاً من حيث القيمة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#f97316" name="القيمة" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">لا توجد بيانات متاحة</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-full md:col-span-1 bg-background shadow-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary">أداء مراكز التوزيع</CardTitle>
          <CardDescription>توزيع المبيعات حسب المراكز</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {centerPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={centerPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {centerPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">لا توجد بيانات متاحة</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
