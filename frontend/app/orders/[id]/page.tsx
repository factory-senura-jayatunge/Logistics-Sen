"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  Clock,
  Truck,
  FileText,
  MapPin,
  Weight,
  History,
  Play,
  Printer,
  XCircle,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getOrder, getCustomerOrders, type OrderDetail, type OrderBasic } from "@/lib/api"

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

const shipmentStatusColors: Record<string, string> = {
  delivered: "bg-success/10 text-success border-success/20",
  in_transit: "bg-info/10 text-info border-info/20",
  delayed: "bg-destructive/10 text-destructive border-destructive/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  pending: "bg-neutral/10 text-neutral border-neutral/20",
}

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"]

function getStatusProgress(status: string): number {
  const index = statusSteps.indexOf(status)
  if (index === -1) return 0
  return ((index + 1) / statusSteps.length) * 100
}

function getShipmentProgress(status: string): number {
  const steps: Record<string, number> = {
    pending: 10,
    processing: 30,
    in_transit: 60,
    delayed: 50,
    delivered: 100,
  }
  return steps[status] || 0
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

function formatETA(eta: string | null): string {
  if (!eta) return "Not set"
  const date = new Date(eta)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "Overdue"
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  return `${diffDays} days`
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [customerOrders, setCustomerOrders] = useState<OrderBasic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const id = parseInt(params.id as string)
        if (isNaN(id)) {
          setError("Invalid order ID")
          return
        }
        const orderData = await getOrder(id)
        setOrder(orderData)

        const otherOrders = await getCustomerOrders(orderData.customer_id, id, 5)
        setCustomerOrders(otherOrders)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
            <h2 className="text-lg font-semibold">Failed to load order</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{order.order_number}</h1>
              <Badge
                variant="outline"
                className={statusColors[order.status] || statusColors.pending}
              >
                {order.status}
              </Badge>
              <Badge
                variant="outline"
                className={priorityColors[order.priority] || priorityColors.medium}
              >
                {order.priority} priority
              </Badge>
            </div>
            <p className="text-muted-foreground">Created {formatDateTime(order.created_at)}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Select defaultValue={order.status}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" title="Print Order">
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Cancel Order"
            className="text-destructive hover:text-destructive"
          >
            <XCircle className="h-4 w-4" />
          </Button>
          <Button>
            <Truck className="mr-2 h-4 w-4" />
            Create Shipment
          </Button>
        </div>
      </div>

      {/* Order Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-2 flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    statusSteps.indexOf(order.status) >= index
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mt-1 text-xs capitalize">{step}</span>
              </div>
            ))}
          </div>
          <Progress value={getStatusProgress(order.status)} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Package className="h-3 w-3" /> Items
                  </p>
                  <p className="text-2xl font-bold">{order.items_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <DollarSign className="h-3 w-3" /> Total Value
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency(order.total_value)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Truck className="h-3 w-3" /> Shipments
                  </p>
                  <p className="text-2xl font-bold">{order.shipments.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" /> Last Updated
                  </p>
                  <p className="text-sm font-medium">{formatDateTime(order.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipments as Cards */}
          {order.shipments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipments
                </CardTitle>
                <CardDescription>Track all shipments for this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="hover:bg-muted/50 cursor-pointer rounded-lg border p-4 transition-colors"
                    onClick={() => router.push(`/shipments/${shipment.id}`)}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{shipment.tracking_number}</span>
                          <Badge
                            variant="outline"
                            className={
                              shipmentStatusColors[shipment.status] || shipmentStatusColors.pending
                            }
                          >
                            {shipment.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{shipment.carrier}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">ETA: {formatETA(shipment.eta)}</p>
                        <p className="text-muted-foreground text-xs">
                          {shipment.eta ? formatShortDate(shipment.eta) : "—"}
                        </p>
                      </div>
                    </div>

                    <Progress value={getShipmentProgress(shipment.status)} className="mb-3 h-1.5" />

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                        <span className="truncate" title={shipment.origin}>
                          {shipment.origin}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        <Play className="text-muted-foreground h-3 w-3" />
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                        <span className="truncate" title={shipment.destination}>
                          {shipment.destination}
                        </span>
                      </div>
                    </div>

                    <div className="text-muted-foreground mt-3 flex items-center gap-4 border-t pt-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Weight className="h-3 w-3" /> {shipment.weight_kg} kg
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatShortDate(shipment.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
              <CardDescription>Order status history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary h-3 w-3 rounded-full" />
                    <div className="bg-border h-full w-px" />
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Order Created</p>
                    <p className="text-muted-foreground text-sm">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                </div>
                {order.status !== "pending" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-primary h-3 w-3 rounded-full" />
                      <div className="bg-border h-full w-px" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">Status Updated</p>
                      <p className="text-muted-foreground text-sm">
                        Changed to {order.status} - {formatDateTime(order.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
                {order.shipments.length > 0 && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-info h-3 w-3 rounded-full" />
                      <div className="bg-border h-full w-px" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">Shipments Created</p>
                      <p className="text-muted-foreground text-sm">
                        {order.shipments.length} shipment(s) linked to this order
                      </p>
                    </div>
                  </div>
                )}
                {order.status === "delivered" ? (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-success h-3 w-3 rounded-full" />
                    </div>
                    <div>
                      <p className="text-success font-medium">Delivered</p>
                      <p className="text-muted-foreground text-sm">Order completed successfully</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="border-muted-foreground/30 h-3 w-3 rounded-full border-2" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Pending Completion</p>
                      <p className="text-muted-foreground text-sm">Awaiting fulfillment</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-muted-foreground text-sm">{order.customer.email}</p>
              </div>
              {order.customer.phone && (
                <div>
                  <p className="text-muted-foreground text-sm">Phone</p>
                  <p className="text-sm">{order.customer.phone}</p>
                </div>
              )}
              {order.customer.address && (
                <div>
                  <p className="text-muted-foreground text-sm">Address</p>
                  <p className="text-sm">{order.customer.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Order History */}
          {customerOrders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4" />
                  Order History
                </CardTitle>
                <CardDescription>Other orders from this customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {customerOrders.map((historyOrder) => (
                  <div
                    key={historyOrder.id}
                    className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors"
                    onClick={() => router.push(`/orders/${historyOrder.id}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{historyOrder.order_number}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatShortDate(historyOrder.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColors[historyOrder.status]}`}
                      >
                        {historyOrder.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatCurrency(historyOrder.total_value)}
                      </span>
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-medium">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer ID</span>
                <span className="font-medium">{order.customer_id}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{formatDateTime(order.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
