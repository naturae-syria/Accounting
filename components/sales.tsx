"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, FileText, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  getProducts,
  getDistributionCenters,
  getSales,
  saveSales,
  updateProductStock,
  updateInventory,
  getSalesByCenterReport,
  getInventory,
} from "@/lib/data-utils"
import type { Product, DistributionCenter, Sale } from "@/lib/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [centers, setCenters] = useState<DistributionCenter[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedCenterForReport, setSelectedCenterForReport] = useState("")
  const [centerSalesReport, setCenterSalesReport] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalCommission: 0,
    salesByCenter: [],
    salesByProduct: [],
  })
  const [currentSale, setCurrentSale] = useState<Sale>({
    id: "",
    productId: "",
    centerId: "",
    quantity: 1,
    price: 0,
    date: new Date().toISOString(),
  })
  const { toast } = useToast()

  const loadData = useCallback(() => {
    try {
      const productsData = getProducts()
      const centersData = getDistributionCenters()
      const salesData = getSales()

      setProducts(productsData)
      setCenters(centersData)
      setSales(salesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddSale = () => {
    try {
      // التحقق من صحة البيانات
      if (!currentSale.productId || !currentSale.centerId || currentSale.quantity <= 0) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى التأكد من اختيار المنتج ومركز التوزيع وإدخال كمية صحيحة",
          variant: "destructive",
        })
        return
      }

      // التحقق من توفر المخزون في مركز التوزيع
      const inventory = getInventory()
      const inventoryItem = inventory.find(
        (item) => item.productId === currentSale.productId && item.centerId === currentSale.centerId,
      )

      if (!inventoryItem || inventoryItem.currentQuantity < currentSale.quantity) {
        toast({
          title: "الكمية غير متوفرة",
          description: `الكمية المتوفرة في مركز التوزيع هي ${inventoryItem?.currentQuantity || 0} فقط`,
          variant: "destructive",
        })
        return
      }

      // إنشاء عملية البيع الجديدة
      const newSale: Sale = {
        ...currentSale,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      }

      // تحديث المبيعات
      const updatedSales = [...sales, newSale]
      saveSales(updatedSales)
      setSales(updatedSales)

      // تحديث المخزون في مركز التوزيع
      updateInventory(currentSale.productId, currentSale.centerId, currentSale.quantity, false)

      // تحديث المخزون الإجمالي للمنتج
      updateProductStock(currentSale.productId, currentSale.quantity)

      // إعادة تحميل البيانات
      loadData()

      setIsAddDialogOpen(false)
      resetCurrentSale()

      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة عملية البيع بنجاح",
      })
    } catch (error) {
      console.error("Error adding sale:", error)
      toast({
        title: "خطأ في إضافة عملية البيع",
        description: "حدث خطأ أثناء إضافة عملية البيع",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSale = (id: string) => {
    try {
      const saleToDelete = sales.find((sale) => sale.id === id)
      if (!saleToDelete) return

      // تحديث المبيعات
      const updatedSales = sales.filter((sale) => sale.id !== id)
      saveSales(updatedSales)
      setSales(updatedSales)

      // إعادة الكمية إلى المخزون في مركز التوزيع
      updateInventory(saleToDelete.productId, saleToDelete.centerId, saleToDelete.quantity, true)

      // إعادة الكمية إلى المخزون الإجمالي للمنتج
      const product = products.find((p) => p.id === saleToDelete.productId)
      if (product) {
        const updatedProduct = {
          ...product,
          stock: product.stock + saleToDelete.quantity,
        }
        const updatedProducts = products.map((p) => (p.id === product.id ? updatedProduct : p))
        setProducts(updatedProducts)
      }

      // إعادة تحميل البيانات
      loadData()

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف عملية البيع بنجاح",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error deleting sale:", error)
      toast({
        title: "خطأ في حذف عملية البيع",
        description: "حدث خطأ أثناء حذف عملية البيع",
        variant: "destructive",
      })
    }
  }

  const resetCurrentSale = () => {
    setCurrentSale({
      id: "",
      productId: "",
      centerId: "",
      quantity: 1,
      price: 0,
      date: new Date().toISOString(),
    })
  }

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    setCurrentSale({
      ...currentSale,
      productId,
      price: product ? product.price : 0,
    })
  }

  const generateReport = () => {
    try {
      let filteredSales = [...sales]

      // تصفية حسب التاريخ إذا تم تحديده
      if (startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // تعيين إلى نهاية اليوم

        filteredSales = filteredSales.filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= start && saleDate <= end
        })
      }

      // حساب الإجماليات
      let totalRevenue = 0
      let totalProfit = 0
      let totalCommission = 0

      // تجميع المبيعات حسب مركز التوزيع
      const salesByCenter: Record<
        string,
        {
          centerId: string
          centerName: string
          sales: number
          revenue: number
          commission: number
        }
      > = {}

      // تجميع المبيعات حسب المنتج
      const salesByProduct: Record<
        string,
        {
          productId: string
          productName: string
          quantity: number
          revenue: number
          profit: number
        }
      > = {}

      filteredSales.forEach((sale) => {
        const product = products.find((p) => p.id === sale.productId)
        const center = centers.find((c) => c.id === sale.centerId)

        if (!product || !center) return

        const saleRevenue = sale.quantity * sale.price
        const saleProfit = sale.quantity * (sale.price - product.cost)
        const saleCommission = saleRevenue * (center.commissionRate / 100)

        totalRevenue += saleRevenue
        totalProfit += saleProfit
        totalCommission += saleCommission

        // إضافة إلى إحصائيات المركز
        if (!salesByCenter[sale.centerId]) {
          salesByCenter[sale.centerId] = {
            centerId: sale.centerId,
            centerName: center.name,
            sales: 0,
            revenue: 0,
            commission: 0,
          }
        }
        salesByCenter[sale.centerId].sales++
        salesByCenter[sale.centerId].revenue += saleRevenue
        salesByCenter[sale.centerId].commission += saleCommission

        // إضافة إلى إحصائيات المنتج
        if (!salesByProduct[sale.productId]) {
          salesByProduct[sale.productId] = {
            productId: sale.productId,
            productName: product.name,
            quantity: 0,
            revenue: 0,
            profit: 0,
          }
        }
        salesByProduct[sale.productId].quantity += sale.quantity
        salesByProduct[sale.productId].revenue += saleRevenue
        salesByProduct[sale.productId].profit += saleProfit
      })

      setReportData({
        totalSales: filteredSales.length,
        totalRevenue,
        totalProfit,
        totalCommission,
        salesByCenter: Object.values(salesByCenter),
        salesByProduct: Object.values(salesByProduct),
      })

      setIsReportDialogOpen(true)
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "خطأ في إنشاء التقرير",
        description: "حدث خطأ أثناء إنشاء تقرير المبيعات",
        variant: "destructive",
      })
    }
  }

  const generateCenterSalesReport = (centerId: string) => {
    try {
      setSelectedCenterForReport(centerId)
      const report = getSalesByCenterReport(centerId, startDate, endDate)
      setCenterSalesReport(report)
    } catch (error) {
      console.error("Error generating center sales report:", error)
      toast({
        title: "خطأ في إنشاء التقرير",
        description: "حدث خطأ أثناء إنشاء تقرير مبيعات المركز",
        variant: "destructive",
      })
    }
  }

  const filteredSales = sales
    .filter((sale) => {
      const product = products.find((p) => p.id === sale.productId)
      const center = centers.find((c) => c.id === sale.centerId)
      return (
        product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">إدارة المبيعات</h2>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary-hover">
            <Plus className="ml-2 h-4 w-4" /> إضافة عملية بيع
          </Button>
          <Button
            variant="outline"
            onClick={generateReport}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            <FileText className="ml-2 h-4 w-4" /> تقرير المبيعات
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="relative w-full md:w-auto">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light" size={18} />
          <Input
            placeholder="البحث عن مبيعات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
          <div>
            <Label htmlFor="startDate">من تاريخ</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="endDate">إلى تاريخ</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      <Card className="bg-background shadow-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary">سجل المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>مركز التوزيع</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => {
                  const product = products.find((p) => p.id === sale.productId)
                  const center = centers.find((c) => c.id === sale.centerId)
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{product?.name || "غير معروف"}</TableCell>
                      <TableCell>{center?.name || "غير معروف"}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell>{sale.price.toLocaleString()} ل.س</TableCell>
                      <TableCell>{(sale.quantity * sale.price).toLocaleString()} ل.س</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteSale(sale.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    لا توجد مبيعات متاحة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* نافذة إضافة عملية بيع */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">إضافة عملية بيع جديدة</DialogTitle>
            <DialogDescription>أدخل تفاصيل عملية البيع الجديدة هنا</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product">المنتج</Label>
              <Select value={currentSale.productId} onValueChange={handleProductChange}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="اختر المنتج" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - المتوفر: {product.stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="center">مركز التوزيع</Label>
              <Select
                value={currentSale.centerId}
                onValueChange={(value) =>
                  setCurrentSale({
                    ...currentSale,
                    centerId: value,
                  })
                }
              >
                <SelectTrigger id="center">
                  <SelectValue placeholder="اختر مركز التوزيع" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">الكمية</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={currentSale.quantity}
                  onChange={(e) =>
                    setCurrentSale({
                      ...currentSale,
                      quantity: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">السعر</Label>
                <Input
                  id="price"
                  type="number"
                  value={currentSale.price}
                  onChange={(e) =>
                    setCurrentSale({
                      ...currentSale,
                      price: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            {currentSale.productId && currentSale.quantity > 0 && currentSale.price > 0 && (
              <div className="bg-muted p-3 rounded-md">
                <p className="font-semibold">ملخص العملية:</p>
                <div className="flex justify-between">
                  <span>الإجمالي:</span>
                  <span>{(currentSale.quantity * currentSale.price).toLocaleString()} ل.س</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddSale} className="bg-primary hover:bg-primary-hover">
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تقرير المبيعات */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-primary">تقرير المبيعات</DialogTitle>
            <DialogDescription>
              {startDate && endDate
                ? `للفترة من ${new Date(startDate).toLocaleDateString()} إلى ${new Date(endDate).toLocaleDateString()}`
                : "تقرير شامل لجميع المبيعات"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">إجمالي المبيعات</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{reportData.totalSales}</p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">إجمالي الإيرادات</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{reportData.totalRevenue.toLocaleString()} ل.س</p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">إجمالي الأرباح</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{reportData.totalProfit.toLocaleString()} ل.س</p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">إجمالي العمولات</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{reportData.totalCommission.toLocaleString()} ل.س</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">المبيعات حسب مراكز التوزيع</h3>
              <Accordion type="single" collapsible className="w-full">
                {reportData.salesByCenter.map((centerData: any) => (
                  <AccordionItem key={centerData.centerId} value={centerData.centerId}>
                    <AccordionTrigger className="hover:bg-muted px-4 py-2 rounded-md">
                      <div className="flex justify-between w-full">
                        <span>{centerData.centerName}</span>
                        <span className="ml-4">{centerData.revenue.toLocaleString()} ل.س</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 bg-muted rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-text-light">عدد المبيعات</p>
                            <p className="font-bold">{centerData.sales}</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-light">الإيرادات</p>
                            <p className="font-bold">{centerData.revenue.toLocaleString()} ل.س</p>
                          </div>
                          <div>
                            <p className="text-sm text-text-light">العمولة</p>
                            <p className="font-bold">{centerData.commission.toLocaleString()} ل.س</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => generateCenterSalesReport(centerData.centerId)}
                          className="bg-primary hover:bg-primary-hover"
                        >
                          عرض تفاصيل المبيعات
                        </Button>

                        {selectedCenterForReport === centerData.centerId && centerSalesReport.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">تفاصيل المبيعات:</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>المنتج</TableHead>
                                  <TableHead>الكمية</TableHead>
                                  <TableHead>السعر</TableHead>
                                  <TableHead>الإجمالي</TableHead>
                                  <TableHead>التاريخ</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {centerSalesReport.map((sale) => (
                                  <TableRow key={sale.id}>
                                    <TableCell>{sale.productName}</TableCell>
                                    <TableCell>{sale.quantity}</TableCell>
                                    <TableCell>{sale.price.toLocaleString()} ل.س</TableCell>
                                    <TableCell>{sale.totalAmount.toLocaleString()} ل.س</TableCell>
                                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">المبيعات حسب المنتجات</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية المباعة</TableHead>
                    <TableHead>الإيرادات</TableHead>
                    <TableHead>الأرباح</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.salesByProduct.length > 0 ? (
                    reportData.salesByProduct.map((productData: any) => (
                      <TableRow key={productData.productId}>
                        <TableCell className="font-medium">{productData.productName}</TableCell>
                        <TableCell>{productData.quantity}</TableCell>
                        <TableCell>{productData.revenue.toLocaleString()} ل.س</TableCell>
                        <TableCell>{productData.profit.toLocaleString()} ل.س</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        لا توجد بيانات متاحة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsReportDialogOpen(false)} className="bg-primary hover:bg-primary-hover">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
