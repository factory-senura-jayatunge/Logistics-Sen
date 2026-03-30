"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Download, AlertTriangle, Upload } from "lucide-react"
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
  getShipments,
  bulkDeleteShipments,
  bulkUpdateShipmentStatus,
  exportShipmentsCSV,
  importShipmentsCSV,
  type Shipment,
} from "@/lib/api"
import { NewShipmentModal } from "@/components/new-shipment-modal"
import { BulkActionsToolbar } from "@/components/bulk-actions-toolbar"
import { CSVImportModal } from "@/components/csv-import-modal"

const statusColors: Record<string, string> = {
  delivered: "bg-success/10 text-success border-success/20",
  in_transit: "bg-info/10 text-info border-info/20",
  delayed: "bg-destructive/10 text-destructive border-destructive/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  pending: "bg-neutral/10 text-neutral border-neutral/20",
}

const shipmentStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "delayed", label: "Delayed" },
]

function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatWeight(kg: number): string {
  return `${kg.toLocaleString()} kg`
}

export default function ShipmentsPage() {
  const router = useRouter()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getShipments({
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      setShipments(data)
      setSelectedIds([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shipments")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchShipments()
  }, [fetchShipments])

  const filteredShipments = shipments.filter((shipment) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      shipment.tracking_number.toLowerCase().includes(query) ||
      shipment.customer.name.toLowerCase().includes(query) ||
      shipment.origin.toLowerCase().includes(query) ||
      shipment.destination.toLowerCase().includes(query) ||
      shipment.carrier.toLowerCase().includes(query)
    )
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredShipments.map((s) => s.id))
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
    await bulkDeleteShipments(selectedIds)
    fetchShipments()
  }

  const handleBulkStatusUpdate = async (status: string) => {
    await bulkUpdateShipmentStatus(selectedIds, status)
    fetchShipments()
  }

  const handleExport = async () => {
    const blob = await exportShipmentsCSV()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "shipments.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">Failed to load shipments</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  const allSelected =
    filteredShipments.length > 0 && selectedIds.length === filteredShipments.length

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipments</h1>
          <p className="text-muted-foreground">Manage and track all shipments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Shipment
          </Button>
        </div>
      </div>

      <NewShipmentModal open={modalOpen} onOpenChange={setModalOpen} onSuccess={fetchShipments} />
      <CSVImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={importShipmentsCSV}
        onSuccess={fetchShipments}
        entityName="Shipments"
        expectedColumns={[
          "customer_id",
          "order_id",
          "origin",
          "destination",
          "carrier",
          "weight_kg",
          "status",
        ]}
      />

      {selectedIds.length > 0 && (
        <div className="mb-4">
          <BulkActionsToolbar
            selectedCount={selectedIds.length}
            onClearSelection={() => setSelectedIds([])}
            onDelete={handleBulkDelete}
            onUpdateStatus={handleBulkStatusUpdate}
            statusOptions={shipmentStatusOptions}
            entityName="shipment"
          />
        </div>
      )}

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>All Shipments ({filteredShipments.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search shipments..."
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
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
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
                <TableHead>Shipment ID</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>ETA</TableHead>
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
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                    No shipments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredShipments.map((shipment) => (
                  <TableRow
                    key={shipment.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    data-selected={selectedIds.includes(shipment.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(shipment.id)}
                        onCheckedChange={(checked) => handleSelectOne(shipment.id, !!checked)}
                        aria-label={`Select shipment ${shipment.tracking_number}`}
                      />
                    </TableCell>
                    <TableCell
                      className="font-medium"
                      onClick={() => router.push(`/shipments/${shipment.id}`)}
                    >
                      {shipment.tracking_number}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/shipments/${shipment.id}`)}>
                      {shipment.origin}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/shipments/${shipment.id}`)}>
                      {shipment.destination}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/shipments/${shipment.id}`)}>
                      {shipment.customer.name}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/shipments/${shipment.id}`)}>
                      {shipment.carrier}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/shipments/${shipment.id}`)}>
                      {formatWeight(shipment.weight_kg)}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/shipments/${shipment.id}`)}>
                      {formatDate(shipment.eta)}
                    </TableCell>
                    <TableCell onClick={() => router.push(`/shipments/${shipment.id}`)}>
                      <Badge
                        variant="outline"
                        className={statusColors[shipment.status] || statusColors.pending}
                      >
                        {shipment.status.replace("_", " ")}
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
