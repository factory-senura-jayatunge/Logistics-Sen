"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Package, AlertTriangle, TrendingUp, Archive, BarChart3, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  getInventoryItems,
  getFacilities,
  bulkDeleteInventory,
  exportInventoryCSV,
  importInventoryCSV,
  type InventoryItem,
  type Facility,
} from "@/lib/api"
import { BulkActionsToolbar } from "@/components/bulk-actions-toolbar"
import { CSVImportModal } from "@/components/csv-import-modal"

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
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [importModalOpen, setImportModalOpen] = useState(false)

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
      setSelectedIds([])
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredItems.map((i) => i.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    }
  }

  const handleBulkDelete = async () => {
    await bulkDeleteInventory(selectedIds)
    fetchData()
  }

  const handleExport = async () => {
    const blob = await exportInventoryCSV()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "inventory.csv"
    a.click()
    URL.revokeObjectURL(url)
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

  const allSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length

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
          <Button variant="outline" onClick={() => setImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => fetchData()}>Sync Inventory</Button>
        </div>
      </div>

      <CSVImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={importInventoryCSV}
        onSuccess={fetchData}
        entityName="Inventory"
        expectedColumns={[
          "sku",
          "name",
          "category",
          "facility_id",
          "quantity",
          "reorder_point",
          "unit_price",
          "status",
        ]}
      />

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

      {selectedIds.length > 0 && (
        <div className="mb-4">
          <BulkActionsToolbar
            selectedCount={selectedIds.length}
            onClearSelection={() => setSelectedIds([])}
            onDelete={handleBulkDelete}
            entityName="item"
          />
        </div>
      )}

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Items ({filteredItems.length})</CardTitle>
              <CardDescription>Current stock levels and status</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search SKU, name, category..."
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline" size="icon" onClick={handleExport} title="Export to CSV">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
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
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
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
                  <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    data-selected={selectedIds.includes(item.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={(checked) => handleSelectOne(item.id, !!checked)}
                        aria-label={`Select item ${item.sku}`}
                      />
                    </TableCell>
                    <TableCell
                      className="font-medium"
                      onClick={() => router.push(`/inventory/${item.id}`)}
                    >
                      {item.sku}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/inventory/${item.id}`)}>
                      {item.name}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/inventory/${item.id}`)}>
                      {item.category}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/inventory/${item.id}`)}>
                      {item.facility?.code || "-"}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={() => router.push(`/inventory/${item.id}`)}
                    >
                      {item.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={() => router.push(`/inventory/${item.id}`)}
                    >
                      {item.reorder_point}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={() => router.push(`/inventory/${item.id}`)}
                    >
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/inventory/${item.id}`)}>
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
