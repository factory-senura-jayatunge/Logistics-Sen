"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  User,
  Calendar,
  Weight,
  AlertTriangle,
  Clock,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getShipment, type ShipmentDetail } from "@/lib/api"

const statusColors: Record<string, string> = {
  delivered: "bg-green-500/10 text-green-600 border-green-200",
  in_transit: "bg-blue-500/10 text-blue-600 border-blue-200",
  delayed: "bg-red-500/10 text-red-600 border-red-200",
  processing: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  pending: "bg-gray-500/10 text-gray-600 border-gray-200",
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-600 border-slate-200",
  medium: "bg-blue-500/10 text-blue-600 border-blue-200",
  high: "bg-orange-500/10 text-orange-600 border-orange-200",
  critical: "bg-red-500/10 text-red-600 border-red-200",
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
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

export default function ShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchShipment() {
      try {
        setLoading(true)
        const id = parseInt(params.id as string)
        if (isNaN(id)) {
          setError("Invalid shipment ID")
          return
        }
        const data = await getShipment(id)
        setShipment(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shipment")
      } finally {
        setLoading(false)
      }
    }
    fetchShipment()
  }, [params.id])

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Failed to load shipment</h2>
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

  if (!shipment) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shipments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{shipment.tracking_number}</h1>
              <Badge variant="outline" className={statusColors[shipment.status] || statusColors.pending}>
                {shipment.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {formatDateTime(shipment.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Origin</p>
                  <p className="text-lg font-medium">{shipment.origin}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-px w-16 bg-border relative">
                    <Truck className="h-4 w-4 absolute -top-2 left-1/2 -translate-x-1/2 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="text-lg font-medium">{shipment.destination}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Carrier
                  </p>
                  <p className="font-medium">{shipment.carrier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Weight className="h-3 w-3" /> Weight
                  </p>
                  <p className="font-medium">{shipment.weight_kg.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> ETA
                  </p>
                  <p className="font-medium">{formatDate(shipment.eta)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
              <CardDescription>Shipment status history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <div className="h-full w-px bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Shipment Created</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(shipment.created_at)}</p>
                  </div>
                </div>
                {shipment.status !== "pending" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <div className="h-full w-px bg-border" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">Status Updated</p>
                      <p className="text-sm text-muted-foreground">
                        Changed to {shipment.status.replace("_", " ")} - {formatDateTime(shipment.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
                {shipment.status === "delivered" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-green-600">Delivered</p>
                      <p className="text-sm text-muted-foreground">Package delivered successfully</p>
                    </div>
                  </div>
                )}
                {shipment.status !== "delivered" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/30" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Pending Delivery</p>
                      <p className="text-sm text-muted-foreground">Awaiting delivery</p>
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
                <p className="font-medium">{shipment.customer.name}</p>
                <p className="text-sm text-muted-foreground">{shipment.customer.email}</p>
              </div>
              {shipment.customer.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-sm">{shipment.customer.phone}</p>
                </div>
              )}
              {shipment.customer.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-sm">{shipment.customer.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {shipment.order && (
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/orders/${shipment.order!.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Related Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{shipment.order.order_number}</p>
                  <Badge variant="outline" className={priorityColors[shipment.order.priority] || priorityColors.medium}>
                    {shipment.order.priority}
                  </Badge>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Items</p>
                    <p className="font-medium">{shipment.order.items_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-medium">{formatCurrency(shipment.order.total_value)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{shipment.order.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDateTime(shipment.order.created_at).split(",")[0]}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-2">Click to view order details</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Shipment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipment ID</span>
                <span className="font-medium">{shipment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking Number</span>
                <span className="font-medium">{shipment.tracking_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer ID</span>
                <span className="font-medium">{shipment.customer_id}</span>
              </div>
              {shipment.order_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-medium">{shipment.order_id}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{formatDateTime(shipment.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
