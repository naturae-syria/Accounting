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
import { Plus, Minus, FileText, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  getProducts,
  saveProducts,
  getDistributionCenters,
  getInventory,
  updateInventory,
  getProductInventoryReport,
} from "@/lib/data-utils"
import type { Product, ProductInventory } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [isProductReportDialogOpen, setIsProductReportDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0)
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [adjustmentCenterId, setAdjustmentCenterId] = useState("")
  const [inventory, setInventory] = useState<ProductInventory[]>([])
  const [centers, setCenters] = useState([])
  const [selectedProductForReport, setSelectedProductForReport] = useState<Product | null>(null)
  const [productInventoryReport, setProductInventoryReport] = useState<any[]>([])
  const { toast } = useToast()

  const loadData = useCallback(() => {
    try {
      const productsData = getProducts()
      const centersData = getDistributionCenters()
      const inventoryData = getInventory()

      setProducts(productsData)
      setCenters(centersData)
      setInventory(inventoryData)
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

  const handleAdjustInventory = () => {
    if (!currentProduct || !adjustmentCenterId) return

    try {
      // تحديث المخزون في مركز التوزيع المحدد
      updateInventory(currentProduct.id, adjustmentCenterId, adjustmentQuantity, adjustmentType === "add")

      // تحديث المخزون الإجمالي للمنتج
      const finalQuantity =
        adjustmentType === "add" ? currentProduct.stock + adjustmentQuantity : currentProduct.stock - adjustmentQuantity

      if (finalQuantity < 0) {
        toast({
          title: "خطأ في الكمية",
          description: "لا يمكن أن تكون الكمية النهائية أقل من صفر",
          variant: "destructive",
        })
        return
      }

      const updatedProduct = {
        ...currentProduct,
        stock: finalQuantity,
      }

      const updatedProducts = products.map((product) => (product.id === currentProduct.id ? updatedProduct : product))

      saveProducts(updatedProducts)
      setProducts(updatedProducts)

      // إعادة تحميل البيانات
      loadData()

      setIsAdjustDialogOpen(false)

      toast({
        title: "تم تعديل المخزون بنجاح",
        description: `تم ${adjustmentType === "add" ? "إضافة" : "خصم"} ${adjustmentQuantity} وحدة من ${currentProduct.name}`,
      })
    } catch (error) {
      console.error("Error adjusting inventory:", error)
      toast({
        title: "خطأ في تعديل المخزون",
        description: "حدث خطأ أثناء تعديل المخزون",
        variant: "destructive",
      })
    }
  }

  const openAdjustDialog = (product: Product, type: "add" | "subtract") => {
    setCurrentProduct(product)
    setAdjustmentType(type)
    setAdjustmentQuantity(0)
    setAdjustmentReason("")
    setAdjustmentCenterId("")
    setIsAdjustDialogOpen(true)
  }

  const generateInventoryReport = () => {
    setIsReportDialogOpen(true)
  }

  const openProductReport = (product: Product) => {
    try {
      setSelectedProductForReport(product)
      const report = getProductInventoryReport(product.id)
      setProductInventoryReport(report)
      setIsProductReportDialogOpen(true)
    } catch (error) {
      console.error("Error generating product report:", error)
      toast({
        title: "خطأ في إنشاء التقرير",
        description: "حدث خطأ أثناء إنشاء تقرير المنتج",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTotalInventoryValue = () => {
    return products.reduce((total, product) => total + product.cost * product.stock, 0)
  }

  const getLowStockProducts = () => {
    return products.filter((product) => product.stock < 10)
  }

  const getProductInventoryByCenterId = (productId: string, centerId: string) => {
    const item = inventory.find((item) => item.productId === productId && item.centerId === centerId)
    return item ? item.currentQuantity : 0
  }

  const getCenterById = (centerId: string) => {
    return centers.find((center) => center.id === centerId) || { name: "غير معروف" }
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">إدارة المخزون</h2>
        <Button
          variant="outline"
          onClick={generateInventoryReport}
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          <FileText className="ml-2 h-4 w-4" /> تقرير المخزون
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light" size={18} />
        <Input
          placeholder="البحث عن منتج..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      <Card className="bg-background shadow-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary">قائمة المخزون</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المنتج</TableHead>
                <TableHead>العلامة التجارية</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>الكمية المتوفرة</TableHead>
                <TableHead>سعر التكلفة</TableHead>
                <TableHead>القيمة الإجمالية</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.brand || "-"}</TableCell>
                    <TableCell>{product.category || "-"}</TableCell>
                    <TableCell>
                      <span className={product.stock < 10 ? "text-red-500 font-bold" : ""}>{product.stock}</span>
                    </TableCell>
                    <TableCell>{product.cost.toLocaleString()} ل.س</TableCell>
                    <TableCell>{(product.cost * product.stock).toLocaleString()} ل.س</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openProductReport(product)}
                          className="ml-2 border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openAdjustDialog(product, "add")}
                          className="ml-2 border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openAdjustDialog(product, "subtract")}
                          className="border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    لا توجد منتجات متاحة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* نافذة تعديل المخزون */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">{adjustmentType === "add" ? "إضافة" : "خصم"} مخزون</DialogTitle>
            <DialogDescription>{currentProduct?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="center">مركز التوزيع</Label>
              <select
                id="center"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={adjustmentCenterId}
                onChange={(e) => setAdjustmentCenterId(e.target.value)}
              >
                <option value="">اختر مركز التوزيع</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>

            {adjustmentCenterId && (
              <div className="grid gap-2">
                <Label htmlFor="current-stock">الكمية الحالية في المركز</Label>
                <Input
                  id="current-stock"
                  value={getProductInventoryByCenterId(currentProduct?.id || "", adjustmentCenterId)}
                  disabled
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="total-stock">إجمالي الكمية المتوفرة</Label>
              <Input id="total-stock" value={currentProduct?.stock || 0} disabled />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adjustment-quantity">كمية {adjustmentType === "add" ? "الإضافة" : "الخصم"}</Label>
              <Input
                id="adjustment-quantity"
                type="number"
                min="1"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(Number.parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adjustment-reason">سبب التعديل</Label>
              <Input
                id="adjustment-reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="مثال: استلام بضاعة جديدة، تلف، إرجاع..."
              />
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="font-semibold">ملخص التعديل:</p>
              <div className="flex justify-between">
                <span>الكمية النهائية في المركز:</span>
                <span>
                  {adjustmentType === "add"
                    ? getProductInventoryByCenterId(currentProduct?.id || "", adjustmentCenterId) + adjustmentQuantity
                    : getProductInventoryByCenterId(currentProduct?.id || "", adjustmentCenterId) - adjustmentQuantity}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>إجمالي الكمية النهائية:</span>
                <span>
                  {adjustmentType === "add"
                    ? (currentProduct?.stock || 0) + adjustmentQuantity
                    : (currentProduct?.stock || 0) - adjustmentQuantity}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleAdjustInventory}
              className="bg-primary hover:bg-primary-hover"
              disabled={!adjustmentCenterId || adjustmentQuantity <= 0}
            >
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تقرير المخزون */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-primary">تقرير المخزون</DialogTitle>
            <DialogDescription>تقرير شامل لحالة المخزون الحالية</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">إجمالي المنتجات</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{products.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">إجمالي قيمة المخزون</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{getTotalInventoryValue().toLocaleString()} ل.س</p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">منتجات منخفضة المخزون</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{getLowStockProducts().length}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-background-light">
                <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  تقرير حسب المنتجات
                </TabsTrigger>
                <TabsTrigger value="centers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  تقرير حسب مراكز التوزيع
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">المنتجات منخفضة المخزون</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم المنتج</TableHead>
                        <TableHead>العلامة التجارية</TableHead>
                        <TableHead>الكمية المتوفرة</TableHead>
                        <TableHead>سعر التكلفة</TableHead>
                        <TableHead>سعر البيع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getLowStockProducts().length > 0 ? (
                        getLowStockProducts().map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.brand || "-"}</TableCell>
                            <TableCell className="text-red-500 font-bold">{product.stock}</TableCell>
                            <TableCell>{product.cost.toLocaleString()} ل.س</TableCell>
                            <TableCell>{product.price.toLocaleString()} ل.س</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            لا توجد منتجات منخفضة المخزون
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 text-primary">ملخص المخزون</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {products.map((product) => (
                      <AccordionItem key={product.id} value={product.id}>
                        <AccordionTrigger className="hover:bg-muted px-4 py-2 rounded-md">
                          <div className="flex justify-between w-full">
                            <span>{product.name}</span>
                            <span className="ml-4">{product.stock} وحدة</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 bg-muted rounded-md">
                            <h4 className="font-semibold mb-2">توزيع المخزون على المراكز:</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>مركز التوزيع</TableHead>
                                  <TableHead>الكمية المتوفرة</TableHead>
                                  <TableHead>آخر تحديث</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {inventory
                                  .filter((item) => item.productId === product.id)
                                  .map((item) => {
                                    const center = getCenterById(item.centerId)
                                    return (
                                      <TableRow key={item.id}>
                                        <TableCell>{center.name}</TableCell>
                                        <TableCell>{item.currentQuantity}</TableCell>
                                        <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                                      </TableRow>
                                    )
                                  })}
                              </TableBody>
                            </Table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="centers">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">مخزون مراكز التوزيع</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {centers.map((center) => (
                      <AccordionItem key={center.id} value={center.id}>
                        <AccordionTrigger className="hover:bg-muted px-4 py-2 rounded-md">
                          <div className="flex justify-between w-full">
                            <span>{center.name}</span>
                            <span className="ml-4">
                              {inventory.filter((item) => item.centerId === center.id).length} منتج
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 bg-muted rounded-md">
                            <h4 className="font-semibold mb-2">المنتجات المتوفرة في المركز:</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>المنتج</TableHead>
                                  <TableHead>الكمية الأصلية</TableHead>
                                  <TableHead>الكمية الحالية</TableHead>
                                  <TableHead>آخر تحديث</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {inventory
                                  .filter((item) => item.centerId === center.id)
                                  .map((item) => {
                                    const product = products.find((p) => p.id === item.productId)
                                    return (
                                      <TableRow key={item.id}>
                                        <TableCell>{product?.name || "غير معروف"}</TableCell>
                                        <TableCell>{item.initialQuantity}</TableCell>
                                        <TableCell>{item.currentQuantity}</TableCell>
                                        <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                                      </TableRow>
                                    )
                                  })}
                              </TableBody>
                            </Table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsReportDialogOpen(false)} className="bg-primary hover:bg-primary-hover">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تقرير المنتج */}
      <Dialog open={isProductReportDialogOpen} onOpenChange={setIsProductReportDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-primary">تقرير المنتج: {selectedProductForReport?.name}</DialogTitle>
            <DialogDescription>تفاصيل توزيع المنتج على مراكز التوزيع</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">إجمالي المخزون</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{selectedProductForReport?.stock}</p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">سعر البيع</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{selectedProductForReport?.price.toLocaleString()} ل.س</p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">سعر التكلفة</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{selectedProductForReport?.cost.toLocaleString()} ل.س</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">توزيع المنتج على مراكز التوزيع</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>مركز التوزيع</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الكمية الأصلية</TableHead>
                    <TableHead>الكمية الحالية</TableHead>
                    <TableHead>آخر تحديث</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productInventoryReport.length > 0 ? (
                    productInventoryReport.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.centerName}</TableCell>
                        <TableCell>{item.centerAddress}</TableCell>
                        <TableCell>{item.initialQuantity}</TableCell>
                        <TableCell>{item.currentQuantity}</TableCell>
                        <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        لا توجد بيانات متاحة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsProductReportDialogOpen(false)} className="bg-primary hover:bg-primary-hover">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
