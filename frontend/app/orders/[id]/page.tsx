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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getOrder, type OrderDetail } from "@/lib/api"

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
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

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true)
        const id = parseInt(params.id as string)
        if (isNaN(id)) {
          setError("Invalid order ID")
          return
        }
        const data = await getOrder(id)
        setOrder(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order")
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
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
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
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

          {order.shipments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Related Shipments
                </CardTitle>
                <CardDescription>Shipments associated with this order</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Origin</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.shipments.map((shipment) => (
                      <TableRow
                        key={shipment.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/shipments/${shipment.id}`)}
                      >
                        <TableCell className="font-medium">{shipment.tracking_number}</TableCell>
                        <TableCell>{shipment.origin}</TableCell>
                        <TableCell>{shipment.destination}</TableCell>
                        <TableCell>{shipment.carrier}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              shipmentStatusColors[shipment.status] || shipmentStatusColors.pending
                            }
                          >
                            {shipment.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

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
