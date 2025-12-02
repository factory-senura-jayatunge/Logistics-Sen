"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Package, AlertTriangle, TrendingUp, Archive, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getInventoryItems, getFacilities, type InventoryItem, type Facility } from "@/lib/api"

const statusColors: Record<string, string> = {
  in_stock: "bg-success/10 text-success border-success/20",
  low_stock: "bg-warning/10 text-warning border-warning/20",
  out_of_stock: "bg-destructive/10 text-destructive border-destructive/20",
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function InventoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facilityFilter, setFacilityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showStats, setShowStats] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [itemsData, facilitiesData] = await Promise.all([
        getInventoryItems({
          facility_id: facilityFilter === "all" ? undefined : parseInt(facilityFilter),
        }),
        getFacilities(),
      ])
      setItems(itemsData)
      setFacilities(facilitiesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }, [facilityFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.sku.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  })

  const stats = {
    totalSkus: items.length,
    lowStock: items.filter((i) => i.status === "low_stock").length,
    outOfStock: items.filter((i) => i.status === "out_of_stock").length,
    totalValue: items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0),
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Failed to load inventory</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Monitor stock levels across all warehouses</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={facilityFilter} onValueChange={setFacilityFilter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select facility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Facilities</SelectItem>
              {facilities.map((f) => (
                <SelectItem key={f.id} value={f.id.toString()}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowStats(!showStats)}
            title={showStats ? "Hide statistics" : "Show statistics"}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button onClick={() => fetchData()}>Sync Inventory</Button>
        </div>
      </div>

      {showStats && (
        <div className="grid gap-4 md:grid-cols-4 flex-shrink-0 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total SKUs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : stats.totalSkus.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Across all facilities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.lowStock}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
              <Archive className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.outOfStock}
              </div>
              <p className="text-xs text-muted-foreground">Need immediate reorder</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-20" /> : formatCurrency(stats.totalValue)}
              </div>
              <p className="text-xs text-muted-foreground">Total stock value</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Items ({filteredItems.length})</CardTitle>
              <CardDescription>Current stock levels and status</CardDescription>
            </div>
            <Input
              placeholder="Search SKU, name, category..."
              className="w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Reorder Point</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/inventory/${item.id}`)}
                  >
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.facility?.code || "-"}</TableCell>
                    <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.reorder_point}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[item.status] || statusColors.in_stock}>
                        {item.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
