"use client"

import { useState, useEffect } from "react"
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
import { Pencil, Trash2, Plus, Eye, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  getDistributionCenters,
  saveDistributionCenters,
  getSales,
  getProducts,
  getCenterInventoryReport,
} from "@/lib/data-utils"
import type { DistributionCenter } from "@/lib/types"

export default function DistributionCenters() {
  const [centers, setCenters] = useState<DistributionCenter[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentCenter, setCurrentCenter] = useState<DistributionCenter>({
    id: "",
    name: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
    commissionRate: 10,
  })
  const [centerSales, setCenterSales] = useState<any[]>([])
  const [centerInventory, setCenterInventory] = useState<any[]>([])
  const [centerStats, setCenterStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalCommission: 0,
    productsSold: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadCenters()
  }, [])

  const loadCenters = () => {
    try {
      const centersData = getDistributionCenters()
      console.log("Loaded centers:", centersData)
      setCenters(centersData)
    } catch (error) {
      console.error("Error loading centers:", error)
      toast({
        title: "خطأ في تحميل مراكز التوزيع",
        description: "حدث خطأ أثناء تحميل بيانات مراكز التوزيع",
        variant: "destructive",
      })
    }
  }

  const handleAddCenter = () => {
    try {
      if (!currentCenter.name) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال اسم مركز التوزيع على الأقل",
          variant: "destructive",
        })
        return
      }

      const newCenter: DistributionCenter = {
        ...currentCenter,
        id: Date.now().toString(),
        commissionRate: currentCenter.commissionRate || 10,
      }

      console.log("Adding new center:", newCenter)

      // تحميل المراكز الحالية مرة أخرى للتأكد من أحدث البيانات
      const currentCenters = getDistributionCenters()
      const updatedCenters = [...currentCenters, newCenter]

      // حفظ المراكز المحدثة
      saveDistributionCenters(updatedCenters)

      // تحديث حالة المراكز في المكون
      setCenters(updatedCenters)
      setIsAddDialogOpen(false)
      resetCurrentCenter()

      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة مركز التوزيع "${newCenter.name}" بنجاح`,
      })
    } catch (error) {
      console.error("Error adding center:", error)
      toast({
        title: "خطأ في إضافة مركز التوزيع",
        description: "حدث خطأ أثناء إضافة مركز التوزيع الجديد",
        variant: "destructive",
      })
    }
  }

  const handleEditCenter = () => {
    try {
      if (!currentCenter.name) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال اسم مركز التوزيع على الأقل",
          variant: "destructive",
        })
        return
      }

      // تحميل المراكز الحالية مرة أخرى للتأكد من أحدث البيانات
      const currentCenters = getDistributionCenters()
      const updatedCenters = currentCenters.map((center) => (center.id === currentCenter.id ? currentCenter : center))

      // حفظ المراكز المحدثة
      saveDistributionCenters(updatedCenters)

      // تحديث حالة المراكز في المكون
      setCenters(updatedCenters)
      setIsEditDialogOpen(false)

      toast({
        title: "تم التعديل بنجاح",
        description: `تم تعديل مركز التوزيع "${currentCenter.name}" بنجاح`,
      })
    } catch (error) {
      console.error("Error editing center:", error)
      toast({
        title: "خطأ في تعديل مركز التوزيع",
        description: "حدث خطأ أثناء تعديل مركز التوزيع",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCenter = (id: string) => {
    try {
      const centerToDelete = centers.find((center) => center.id === id)

      // تحميل المراكز الحالية مرة أخرى للتأكد من أحدث البيانات
      const currentCenters = getDistributionCenters()
      const updatedCenters = currentCenters.filter((center) => center.id !== id)

      // حفظ المراكز المحدثة
      saveDistributionCenters(updatedCenters)

      // تحديث حالة المراكز في المكون
      setCenters(updatedCenters)

      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف مركز التوزيع "${centerToDelete?.name}" بنجاح`,
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error deleting center:", error)
      toast({
        title: "خطأ في حذف مركز التوزيع",
        description: "حدث خطأ أثناء حذف مركز التوزيع",
        variant: "destructive",
      })
    }
  }

  const resetCurrentCenter = () => {
    setCurrentCenter({
      id: "",
      name: "",
      address: "",
      contactPerson: "",
      phone: "",
      email: "",
      commissionRate: 10,
    })
  }

  const openEditDialog = (center: DistributionCenter) => {
    setCurrentCenter({ ...center })
    setIsEditDialogOpen(true)
  }

  const openDetailsDialog = (center: DistributionCenter) => {
    try {
      setCurrentCenter({ ...center })

      // الحصول على بيانات المبيعات لهذا المركز
      const sales = getSales().filter((sale) => sale.centerId === center.id)
      const products = getProducts()

      // حساب الإحصائيات
      let totalRevenue = 0
      let totalProductsSold = 0

      const salesWithProductDetails = sales.map((sale) => {
        const product = products.find((p) => p.id === sale.productId)
        const saleRevenue = sale.quantity * sale.price
        totalRevenue += saleRevenue
        totalProductsSold += sale.quantity

        return {
          ...sale,
          productName: product?.name || "غير معروف",
          revenue: saleRevenue,
        }
      })

      setCenterSales(salesWithProductDetails)
      setCenterStats({
        totalSales: sales.length,
        totalRevenue: totalRevenue,
        totalCommission: totalRevenue * (center.commissionRate / 100),
        productsSold: totalProductsSold,
      })

      // الحصول على بيانات المخزون لهذا المركز
      const inventoryReport = getCenterInventoryReport(center.id)
      setCenterInventory(inventoryReport)

      setIsDetailsDialogOpen(true)
    } catch (error) {
      console.error("Error opening details dialog:", error)
      toast({
        title: "خطأ في عرض التفاصيل",
        description: "حدث خطأ أثناء تحميل تفاصيل مركز التوزيع",
        variant: "destructive",
      })
    }
  }

  const filteredCenters = centers.filter((center) => center.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">إدارة مراكز التوزيع</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary-hover">
          <Plus className="ml-2 h-4 w-4" /> إضافة مركز توزيع جديد
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light" size={18} />
        <Input
          placeholder="البحث عن مركز توزيع..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      <Card className="bg-background shadow-custom">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary">قائمة مراكز التوزيع</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المركز</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>الشخص المسؤول</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>نسبة العمولة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCenters.length > 0 ? (
                filteredCenters.map((center) => (
                  <TableRow key={center.id}>
                    <TableCell className="font-medium">{center.name}</TableCell>
                    <TableCell>{center.address}</TableCell>
                    <TableCell>{center.contactPerson}</TableCell>
                    <TableCell>{center.phone}</TableCell>
                    <TableCell>{center.commissionRate}%</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDetailsDialog(center)}
                          className="ml-2 border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(center)}
                          className="ml-2 border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteCenter(center.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    لا توجد مراكز توزيع متاحة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* نافذة إضافة مركز توزيع */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">إضافة مركز توزيع جديد</DialogTitle>
            <DialogDescription>أدخل تفاصيل مركز التوزيع الجديد هنا</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">اسم المركز</Label>
              <Input
                id="name"
                value={currentCenter.name}
                onChange={(e) =>
                  setCurrentCenter({
                    ...currentCenter,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">العنوان</Label>
              <Input
                id="address"
                value={currentCenter.address}
                onChange={(e) =>
                  setCurrentCenter({
                    ...currentCenter,
                    address: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPerson">الشخص المسؤول</Label>
              <Input
                id="contactPerson"
                value={currentCenter.contactPerson}
                onChange={(e) =>
                  setCurrentCenter({
                    ...currentCenter,
                    contactPerson: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={currentCenter.phone}
                  onChange={(e) =>
                    setCurrentCenter({
                      ...currentCenter,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  value={currentCenter.email}
                  onChange={(e) =>
                    setCurrentCenter({
                      ...currentCenter,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commissionRate">نسبة العمولة (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                value={currentCenter.commissionRate}
                onChange={(e) =>
                  setCurrentCenter({
                    ...currentCenter,
                    commissionRate: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddCenter} className="bg-primary hover:bg-primary-hover">
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تعديل مركز توزيع */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">تعديل مركز التوزيع</DialogTitle>
            <DialogDescription>قم بتعديل تفاصيل مركز التوزيع هنا</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">اسم المركز</Label>
              <Input
                id="edit-name"
                value={currentCenter.name}
                onChange={(e) =>
                  setCurrentCenter({
                    ...currentCenter,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-address">العنوان</Label>
              <Input
                id="edit-address"
                value={currentCenter.address}
                onChange={(e) =>
                  setCurrentCenter({
                    ...currentCenter,
                    address: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contactPerson">الشخص المسؤول</Label>
              <Input
                id="edit-contactPerson"
                value={currentCenter.contactPerson}
                onChange={(e) =>
                  setCurrentCenter({
                    ...currentCenter,
                    contactPerson: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">رقم الهاتف</Label>
                <Input
                  id="edit-phone"
                  value={currentCenter.phone}
                  onChange={(e) =>
                    setCurrentCenter({
                      ...currentCenter,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                <Input
                  id="edit-email"
                  value={currentCenter.email}
                  onChange={(e) =>
                    setCurrentCenter({
                      ...currentCenter,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-commissionRate">نسبة العمولة (%)</Label>
              <Input
                id="edit-commissionRate"
                type="number"
                value={currentCenter.commissionRate}
                onChange={(e) =>
                  setCurrentCenter({
                    ...currentCenter,
                    commissionRate: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditCenter} className="bg-primary hover:bg-primary-hover">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تفاصيل مركز التوزيع */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-primary">تفاصيل مركز التوزيع: {currentCenter.name}</DialogTitle>
            <DialogDescription>معلومات مفصلة عن المبيعات والمخزون</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">إجمالي المبيعات</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{centerStats.totalSales}</p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">إجمالي الإيرادات</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{centerStats.totalRevenue.toLocaleString()} ل.س</p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">إجمالي العمولة</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{centerStats.totalCommission.toLocaleString()} ل.س</p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-custom">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-sm text-primary">المنتجات المباعة</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-2xl font-bold">{centerStats.productsSold}</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">معلومات الاتصال</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-light">العنوان</p>
                  <p>{currentCenter.address}</p>
                </div>
                <div>
                  <p className="text-sm text-text-light">الشخص المسؤول</p>
                  <p>{currentCenter.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-text-light">رقم الهاتف</p>
                  <p>{currentCenter.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-text-light">البريد الإلكتروني</p>
                  <p>{currentCenter.email}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">مخزون المنتجات</h3>
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
                  {centerInventory.length > 0 ? (
                    centerInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.initialQuantity}</TableCell>
                        <TableCell>{item.currentQuantity}</TableCell>
                        <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        لا توجد منتجات متاحة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-primary">سجل المبيعات</h3>
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
                  {centerSales.length > 0 ? (
                    centerSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.productName}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>{sale.price.toLocaleString()} ل.س</TableCell>
                        <TableCell>{sale.revenue.toLocaleString()} ل.س</TableCell>
                        <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        لا توجد مبيعات متاحة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)} className="bg-primary hover:bg-primary-hover">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
