"use client"

import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dashboard from "@/components/dashboard"
import Products from "@/components/products"
import DistributionCenters from "@/components/distribution-centers"
import Sales from "@/components/sales"
import Inventory from "@/components/inventory"
import CustomReports from "@/components/custom-reports"
import { initializeData } from "@/lib/data-utils"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { toast } = useToast()

  useEffect(() => {
    initializeData()

    toast({
      title: "مرحباً بك في نظام إدارة المحاسبة والتوزيع",
      description: "يمكنك البدء بإضافة المنتجات ومراكز التوزيع",
    })
  }, [toast])

  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList className="grid w-full grid-cols-6 bg-background-light">
        <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          لوحة التحكم
        </TabsTrigger>
        <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          المنتجات
        </TabsTrigger>
        <TabsTrigger value="centers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          مراكز التوزيع
        </TabsTrigger>
        <TabsTrigger value="sales" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          المبيعات
        </TabsTrigger>
        <TabsTrigger value="inventory" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          الجرد
        </TabsTrigger>
        <TabsTrigger value="customReports" className="data-[state=active]:bg-primary data-[state=active]:text-white">
          التقارير المخصصة
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <Dashboard />
      </TabsContent>

      <TabsContent value="products">
        <Products />
      </TabsContent>

      <TabsContent value="centers">
        <DistributionCenters />
      </TabsContent>

      <TabsContent value="sales">
        <Sales />
      </TabsContent>

      <TabsContent value="inventory">
        <Inventory />
      </TabsContent>

      <TabsContent value="customReports">
        <CustomReports />
      </TabsContent>
    </Tabs>
  )
}
