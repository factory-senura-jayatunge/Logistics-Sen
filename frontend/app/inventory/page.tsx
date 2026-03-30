"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Package, AlertTriangle, TrendingUp, Archive, BarChart3, BrainCircuit, Clock } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import {
  getInventoryItems,
  getFacilities,
  getStockoutAlerts,
  type InventoryItem,
  type Facility,
  type ForecastItem,
} from "@/lib/api"

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
  const [stockoutAlerts, setStockoutAlerts] = useState<ForecastItem[]>([])
  const [facilityFilter, setFacilityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showStats, setShowStats] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [itemsData, facilitiesData, alertsData] = await Promise.all([
        getInventoryItems({
          facility_id: facilityFilter === "all" ? undefined : parseInt(facilityFilter),
        }),
        getFacilities(),
        getStockoutAlerts(14).catch(() => ({ alerts: [] })),
      ])
      setItems(itemsData)
      setFacilities(facilitiesData)
      setStockoutAlerts(alertsData.alerts)
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
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">Failed to load inventory</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
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
        <div className="mb-6 grid flex-shrink-0 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total SKUs
              </CardTitle>
              <Package className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : stats.totalSkus.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">Across all facilities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Low Stock Items
              </CardTitle>
              <AlertTriangle className="text-warning h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.lowStock}
              </div>
              <p className="text-muted-foreground text-xs">Require attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Out of Stock
              </CardTitle>
              <Archive className="text-destructive h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.outOfStock}
              </div>
              <p className="text-muted-foreground text-xs">Need immediate reorder</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Inventory Value
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-20" /> : formatCurrency(stats.totalValue)}
              </div>
              <p className="text-muted-foreground text-xs">Total stock value</p>
            </CardContent>
          </Card>
        </div>
      )}

      {stockoutAlerts.length > 0 && (
        <Card className="mb-6 flex-shrink-0 border-warning/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BrainCircuit className="text-warning h-5 w-5" />
              Predictive Stockout Alerts
            </CardTitle>
            <CardDescription>
              Items predicted to need reordering within the next 14 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stockoutAlerts.slice(0, 6).map((alert) => (
                <div
                  key={alert.item_id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      alert.risk_level === "critical"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {alert.risk_level === "critical" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{alert.name}</p>
                    <p className="text-muted-foreground text-xs">{alert.sku}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Progress
                        value={Math.min(
                          (alert.current_quantity / Math.max(alert.reorder_point, 1)) * 100,
                          100,
                        )}
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs font-medium">
                        {alert.current_quantity}/{alert.reorder_point}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        ~{Math.round(alert.days_until_stockout)}d until stockout
                      </span>
                      {alert.suggested_reorder_qty > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Reorder {alert.suggested_reorder_qty}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {stockoutAlerts.length > 6 && (
              <p className="text-muted-foreground mt-3 text-center text-xs">
                +{stockoutAlerts.length - 6} more items need attention
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="flex min-h-0 flex-1 flex-col">
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
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/50 cursor-pointer"
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
                      <Badge
                        variant="outline"
                        className={statusColors[item.status] || statusColors.in_stock}
                      >
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
