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
import { Pencil, Trash2, Plus, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getProducts, saveProducts, getProductsFromFile } from "@/lib/data-utils"
import type { Product } from "@/lib/types"

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentProduct, setCurrentProduct] = useState<Product>({
    id: "",
    name: "",
    description: "",
    price: 0,
    cost: 0,
    stock: 0,
    brand: "",
    category: "",
    image: "",
  })
  const { toast } = useToast()

  const loadProducts = useCallback(() => {
    try {
      const productsData = getProducts()
      console.log("Loaded products:", productsData)
      setProducts(productsData)
    } catch (error) {
      console.error("Error loading products:", error)
      toast({
        title: "خطأ في تحميل المنتجات",
        description: "حدث خطأ أثناء تحميل بيانات المنتجات",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleAddProduct = () => {
    try {
      if (!currentProduct.name) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال اسم المنتج على الأقل",
          variant: "destructive",
        })
        return
      }

      // تحويل السعر إلى الليرة السورية إذا تم إدخاله بالريال البرازيلي
      const priceInSYP = currentProduct.price || 0
      const costInSYP = currentProduct.cost || priceInSYP * 0.7

      const newProduct: Product = {
        ...currentProduct,
        id: Date.now().toString(),
        price: priceInSYP,
        cost: costInSYP,
        stock: currentProduct.stock || 0,
      }

      console.log("Adding new product:", newProduct)

      // تحميل المنتجات الحالية مرة أخرى للتأكد من أحدث البيانات
      const currentProducts = getProducts()
      const updatedProducts = [...currentProducts, newProduct]

      // حفظ المنتجات المحدثة
      saveProducts(updatedProducts)

      // تحديث حالة المنتجات في المكون
      setProducts(updatedProducts)
      setIsAddDialogOpen(false)
      resetCurrentProduct()

      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة المنتج "${newProduct.name}" بنجاح`,
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "خطأ في إضافة المنتج",
        description: "حدث خطأ أثناء إضافة المنتج الجديد",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = () => {
    try {
      if (!currentProduct.name) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى إدخال اسم المنتج على الأقل",
          variant: "destructive",
        })
        return
      }

      // تحميل المنتجات الحالية مرة أخرى للتأكد من أحدث البيانات
      const currentProducts = getProducts()
      const updatedProducts = currentProducts.map((product) =>
        product.id === currentProduct.id ? currentProduct : product,
      )

      // حفظ المنتجات المحدثة
      saveProducts(updatedProducts)

      // تحديث حالة المنتجات في المكون
      setProducts(updatedProducts)
      setIsEditDialogOpen(false)

      toast({
        title: "تم التعديل بنجاح",
        description: `تم تعديل المنتج "${currentProduct.name}" بنجاح`,
      })
    } catch (error) {
      console.error("Error editing product:", error)
      toast({
        title: "خطأ في تعديل المنتج",
        description: "حدث خطأ أثناء تعديل المنتج",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = (id: string) => {
    try {
      const productToDelete = products.find((product) => product.id === id)

      // تحميل المنتجات الحالية مرة أخرى للتأكد من أحدث البيانات
      const currentProducts = getProducts()
      const updatedProducts = currentProducts.filter((product) => product.id !== id)

      // حفظ المنتجات المحدثة
      saveProducts(updatedProducts)

      // تحديث حالة المنتجات في المكون
      setProducts(updatedProducts)

      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف المنتج "${productToDelete?.name}" بنجاح`,
        variant: "destructive",
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "خطأ في حذف المنتج",
        description: "حدث خطأ أثناء حذف المنتج",
        variant: "destructive",
      })
    }
  }

  const resetCurrentProduct = () => {
    setCurrentProduct({
      id: "",
      name: "",
      description: "",
      price: 0,
      cost: 0,
      stock: 0,
      brand: "",
      category: "",
      image: "",
    })
  }

  const openEditDialog = (product: Product) => {
    setCurrentProduct({ ...product })
    setIsEditDialogOpen(true)
  }

  const handleImportProducts = () => {
    try {
      const importedProducts = getProductsFromFile()
      if (importedProducts && importedProducts.length > 0) {
        saveProducts(importedProducts)
        setProducts(importedProducts)

        toast({
          title: "تم استيراد المنتجات بنجاح",
          description: `تم استيراد ${importedProducts.length} منتج من الملف`,
        })
      }
    } catch (error) {
      console.error("Error importing products:", error)
      toast({
        title: "خطأ في استيراد المنتجات",
        description: "حدث خطأ أثناء استيراد المنتجات من الملف",
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

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">إدارة المنتجات</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleImportProducts}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            استيراد المنتجات من الملف
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary-hover">
            <Plus className="ml-2 h-4 w-4" /> إضافة منتج جديد
          </Button>
        </div>
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
          <CardTitle className="text-primary">قائمة المنتجات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-text-light mb-4">عدد المنتجات: {filteredProducts.length}</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المنتج</TableHead>
                <TableHead>العلامة التجارية</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>سعر البيع (ل.س)</TableHead>
                <TableHead>سعر التكلفة (ل.س)</TableHead>
                <TableHead>الكمية المتوفرة</TableHead>
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
                    <TableCell>{product.price.toLocaleString()} ل.س</TableCell>
                    <TableCell>{product.cost.toLocaleString()} ل.س</TableCell>
                    <TableCell className={product.stock < 10 ? "text-red-500 font-bold" : ""}>
                      {product.stock}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(product)}
                          className="ml-2 border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
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

      {/* نافذة إضافة منتج */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">إضافة منتج جديد</DialogTitle>
            <DialogDescription>أدخل تفاصيل المنتج الجديد هنا</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">اسم المنتج</Label>
              <Input
                id="name"
                value={currentProduct.name}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">وصف المنتج</Label>
              <Input
                id="description"
                value={currentProduct.description}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="brand">العلامة التجارية</Label>
                <Input
                  id="brand"
                  value={currentProduct.brand}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      brand: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">الفئة</Label>
                <Input
                  id="category"
                  value={currentProduct.category}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      category: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">سعر البيع (ل.س)</Label>
                <Input
                  id="price"
                  type="number"
                  value={currentProduct.price}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      price: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost">سعر التكلفة (ل.س)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={currentProduct.cost}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      cost: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">الكمية المتوفرة</Label>
              <Input
                id="stock"
                type="number"
                value={currentProduct.stock}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    stock: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">رابط الصورة</Label>
              <Input
                id="image"
                value={currentProduct.image}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    image: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddProduct} className="bg-primary hover:bg-primary-hover">
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تعديل منتج */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">تعديل المنتج</DialogTitle>
            <DialogDescription>قم بتعديل تفاصيل المنتج هنا</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">اسم المنتج</Label>
              <Input
                id="edit-name"
                value={currentProduct.name}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">وصف المنتج</Label>
              <Input
                id="edit-description"
                value={currentProduct.description}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-brand">العلامة التجارية</Label>
                <Input
                  id="edit-brand"
                  value={currentProduct.brand}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      brand: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">الفئة</Label>
                <Input
                  id="edit-category"
                  value={currentProduct.category}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      category: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">سعر البيع (ل.س)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={currentProduct.price}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      price: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cost">سعر التكلفة (ل.س)</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  value={currentProduct.cost}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      cost: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stock">الكمية المتوفرة</Label>
              <Input
                id="edit-stock"
                type="number"
                value={currentProduct.stock}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    stock: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">رابط الصورة</Label>
              <Input
                id="edit-image"
                value={currentProduct.image}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    image: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditProduct} className="bg-primary hover:bg-primary-hover">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
