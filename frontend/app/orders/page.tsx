"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Download, AlertTriangle, BarChart3, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getOrders,
  bulkDeleteOrders,
  bulkUpdateOrderStatus,
  exportOrdersCSV,
  importOrdersCSV,
  type Order,
} from "@/lib/api"
import { NewOrderModal } from "@/components/new-order-modal"
import { BulkActionsToolbar } from "@/components/bulk-actions-toolbar"
import { CSVImportModal } from "@/components/csv-import-modal"

const statusColors: Record<string, string> = {
  pending: "bg-neutral/10 text-neutral border-neutral/20",
  confirmed: "bg-info/10 text-info border-info/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  shipped: "bg-secondary/10 text-secondary border-secondary/20",
  delivered: "bg-success/10 text-success border-success/20",
}

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-info/10 text-info border-info/20",
  high: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
}

const orderStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      setOrders(data)
      setSelectedIds([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      order.order_number.toLowerCase().includes(query) ||
      order.customer.name.toLowerCase().includes(query)
    )
  })

  const stats = {
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    totalValue: orders.reduce((sum, o) => sum + o.total_value, 0),
  }

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedIds(filteredOrders.map((o) => o.id))
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
    await bulkDeleteOrders(selectedIds)
    fetchOrders()
  }

  const handleBulkStatusUpdate = async (status: string) => {
    await bulkUpdateOrderStatus(selectedIds, status)
    fetchOrders()
  }

  const handleExport = async () => {
    const blob = await exportOrdersCSV()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "orders.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">Failed to load orders</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  const allSelected = filteredOrders.length > 0 && selectedIds.length === filteredOrders.length

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
        </div>
        <div className="flex items-center gap-2">
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
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      <NewOrderModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchOrders} />
      <CSVImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={importOrdersCSV}
        onSuccess={fetchOrders}
        entityName="Orders"
        expectedColumns={["customer_id", "items_count", "total_value", "priority", "status"]}
      />

      {showStats && (
        <div className="mb-6 grid flex-shrink-0 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.pending}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.processing}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">Shipped</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.shipped}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : formatCurrency(stats.totalValue)}
              </div>
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
            onUpdateStatus={handleBulkStatusUpdate}
            statusOptions={orderStatusOptions}
            entityName="order"
          />
        </div>
      )}

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search orders..."
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Priority</TableHead>
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
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    data-selected={selectedIds.includes(order.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(order.id)}
                        onCheckedChange={(checked: boolean | "indeterminate") => handleSelectOne(order.id, !!checked)}
                        aria-label={`Select order ${order.order_number}`}
                      />
                    </TableCell>
                    <TableCell
                      className="font-medium"
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      {order.order_number}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/orders/${order.id}`)}>
                      {order.customer.name}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/orders/${order.id}`)}>
                      {order.items_count}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/orders/${order.id}`)}>
                      {formatCurrency(order.total_value)}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/orders/${order.id}`)}>
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/orders/${order.id}`)}>
                      <Badge
                        variant="outline"
                        className={priorityColors[order.priority] || priorityColors.medium}
                      >
                        {order.priority}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => router.push(`/orders/${order.id}`)}>
                      <Badge
                        variant="outline"
                        className={statusColors[order.status] || statusColors.pending}
                      >
                        {order.status}
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
