"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { CustomReport } from "@/lib/types"

export default function CustomReports() {
  const [reports, setReports] = useState<CustomReport[]>([])
  const [name, setName] = useState("")
  const [type, setType] = useState<CustomReport["type"]>("center-sales")
  const [columns, setColumns] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    fetch("/api/custom-reports")
      .then((res) => res.json())
      .then((data: CustomReport[]) => setReports(data))
      .catch(() =>
        toast({
          title: "خطأ",
          description: "تعذر تحميل التقارير المخصصة",
          variant: "destructive",
        }),
      )
  }, [toast])

  const handleAdd = async () => {
    if (!name) return
    const cols = columns
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)

    try {
      const res = await fetch("/api/custom-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, columns: cols }),
      })
      const newReport = await res.json()
      setReports([...reports, newReport])
      setName("")
      setColumns("")
    } catch {
      toast({
        title: "خطأ",
        description: "تعذر إضافة التقرير",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/custom-reports/${id}`, { method: "DELETE" })
      setReports(reports.filter((r) => r.id !== id))
    } catch {
      toast({
        title: "خطأ",
        description: "تعذر حذف التقرير",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>إنشاء تقرير مخصص</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="اسم التقرير"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select value={type} onValueChange={(v) => setType(v as CustomReport["type"])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="نوع التقرير" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="center-sales">مبيعات مركز</SelectItem>
              <SelectItem value="center-inventory">مخزون مركز</SelectItem>
              <SelectItem value="product-inventory">مخزون منتج</SelectItem>
              <SelectItem value="inventory-log">سجل المخزون</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="الأعمدة (مثال: productName,quantity)"
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
          />
          <Button onClick={handleAdd} className="mt-2">
            <Plus className="ml-2 h-4 w-4" /> إضافة
          </Button>
        </CardContent>
      </Card>

      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>التقارير المخصصة</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الأعمدة</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.name}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.columns.join(", ")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" onClick={() => handleDelete(report.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
