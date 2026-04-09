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
  Navigation,
  Wifi,
  WifiOff,
} from "lucide-react"
import type { LatLngExpression } from "leaflet"
import { useMap } from "react-leaflet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Map,
  MapMarker,
  MapPopup,
  MapPolyline,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map"
import { getShipment, type ShipmentCheckpoint, type ShipmentDetail } from "@/lib/api"
import { useShipmentWebSocket } from "@/hooks/use-shipment-ws"
import { getCoordinatesForLocation } from "@/lib/locations"

const statusColors: Record<string, string> = {
  delivered: "bg-success/10 text-success border-success/20",
  in_transit: "bg-info/10 text-info border-info/20",
  delayed: "bg-destructive/10 text-destructive border-destructive/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  pending: "bg-neutral/10 text-neutral border-neutral/20",
}

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-info/10 text-info border-info/20",
  high: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
}

const checkpointToneMap: Record<string, { badge: string; dot: string }> = {
  delivered: {
    badge: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
  },
  delayed: {
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
  in_transit: {
    badge: "bg-info/10 text-info border-info/20",
    dot: "bg-info",
  },
  out_for_delivery: {
    badge: "bg-info/10 text-info border-info/20",
    dot: "bg-info",
  },
  departed: {
    badge: "bg-info/10 text-info border-info/20",
    dot: "bg-info",
  },
  processing: {
    badge: "bg-warning/10 text-warning border-warning/20",
    dot: "bg-warning",
  },
  received: {
    badge: "bg-neutral/10 text-neutral border-neutral/20",
    dot: "bg-neutral",
  },
  pending: {
    badge: "bg-neutral/10 text-neutral border-neutral/20",
    dot: "bg-neutral",
  },
}

type TimelineItem = Pick<ShipmentCheckpoint, "location_name" | "status" | "notes" | "timestamp"> & {
  key: string
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

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ")
}

function getCheckpointTone(status: string) {
  return checkpointToneMap[status] || checkpointToneMap.pending
}

function buildFallbackTimeline(shipment: ShipmentDetail): TimelineItem[] {
  const items: TimelineItem[] = [
    {
      key: "created",
      location_name: shipment.origin,
      status: "received",
      notes: "Shipment created.",
      timestamp: shipment.created_at,
    },
  ]

  if (shipment.status !== "pending") {
    items.push({
      key: "updated",
      location_name:
        shipment.status === "delivered" ? shipment.destination : shipment.origin,
      status: shipment.status,
      notes: `Status changed to ${formatStatusLabel(shipment.status)}.`,
      timestamp: shipment.updated_at,
    })
  }

  return items
}

function ShipmentMapBounds({ points }: { points: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 7)
      return
    }
    map.fitBounds(points, { padding: [24, 24] })
  }, [map, points])

  return null
}

export default function ShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { lastUpdate, isConnected } = useShipmentWebSocket(shipment?.id ?? null)

  useEffect(() => {
    if (lastUpdate) {
      setShipment((prev) => (prev ? { ...prev, status: lastUpdate.new_status } : prev))
    }
  }, [lastUpdate])

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
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
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

  const timelineItems = (shipment.checkpoints?.length
    ? shipment.checkpoints.map((checkpoint) => ({
        key: checkpoint.id.toString(),
        location_name: checkpoint.location_name,
        status: checkpoint.status,
        notes: checkpoint.notes,
        timestamp: checkpoint.timestamp,
      }))
    : buildFallbackTimeline(shipment)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const checkpointPoints = (shipment.checkpoints || [])
    .map((checkpoint) => {
      const coords =
        checkpoint.latitude != null && checkpoint.longitude != null
          ? ([checkpoint.latitude, checkpoint.longitude] as [number, number])
          : getCoordinatesForLocation(checkpoint.location_name)

      return coords ? { checkpoint, coords } : null
    })
    .filter((item): item is { checkpoint: ShipmentCheckpoint; coords: [number, number] } =>
      Boolean(item)
    )

  const mapCenter =
    checkpointPoints[0]?.coords ||
    getCoordinatesForLocation(shipment.origin) ||
    ([39.8283, -98.5795] as [number, number])

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
              <Badge
                variant="outline"
                className={statusColors[shipment.status] || statusColors.pending}
              >
                {shipment.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Created {formatDateTime(shipment.created_at)}</p>
              {isConnected ? (
                <span className="text-success flex items-center gap-1 text-xs">
                  <Wifi className="h-3 w-3" /> Live
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <WifiOff className="h-3 w-3" /> Offline
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
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
                  <p className="text-muted-foreground text-sm">Origin</p>
                  <p className="text-lg font-medium">{shipment.origin}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-border relative h-px w-16">
                    <Truck className="text-muted-foreground absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2" />
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-muted-foreground text-sm">Destination</p>
                  <p className="text-lg font-medium">{shipment.destination}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Truck className="h-3 w-3" /> Carrier
                  </p>
                  <p className="font-medium">{shipment.carrier}</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Weight className="h-3 w-3" /> Weight
                  </p>
                  <p className="font-medium">{shipment.weight_kg.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
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
                <MapPin className="h-5 w-5" />
                Journey Map
              </CardTitle>
              <CardDescription>Checkpoint route across the shipment journey</CardDescription>
            </CardHeader>
            <CardContent>
              {checkpointPoints.length > 0 ? (
                <Map center={mapCenter satisfies LatLngExpression} zoom={5} className="h-[320px]">
                  <MapTileLayer />
                  <MapZoomControl />
                  <ShipmentMapBounds points={checkpointPoints.map((item) => item.coords)} />
                  {checkpointPoints.length > 1 && (
                    <MapPolyline
                      positions={checkpointPoints.map((item) => item.coords) as LatLngExpression[]}
                      pathOptions={{
                        color: "var(--color-info)",
                        weight: 3,
                        opacity: 0.8,
                      }}
                    />
                  )}
                  {checkpointPoints.map(({ checkpoint, coords }, index) => {
                    const isFirst = index === 0
                    const isLast = index === checkpointPoints.length - 1
                    const tone = getCheckpointTone(checkpoint.status)

                    return (
                      <MapMarker
                        key={checkpoint.id}
                        position={coords satisfies LatLngExpression}
                        icon={
                          <div
                            className={`border-background flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-md ${tone.dot}`}
                          >
                            {isFirst ? (
                              <Truck className="text-background h-3.5 w-3.5" />
                            ) : isLast ? (
                              <Navigation className="text-background h-3.5 w-3.5" />
                            ) : (
                              <MapPin className="text-background h-3.5 w-3.5" />
                            )}
                          </div>
                        }
                        iconAnchor={[14, 14]}
                      >
                        <MapPopup>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold">{checkpoint.location_name}</p>
                              <Badge variant="outline" className={tone.badge}>
                                {formatStatusLabel(checkpoint.status)}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {formatDateTime(checkpoint.timestamp)}
                            </p>
                            {checkpoint.notes && (
                              <p className="text-muted-foreground text-sm">{checkpoint.notes}</p>
                            )}
                          </div>
                        </MapPopup>
                      </MapMarker>
                    )
                  })}
                </Map>
              ) : (
                <div className="text-muted-foreground flex h-[320px] items-center justify-center rounded-md border border-dashed text-sm">
                  Location data unavailable for this shipment.
                </div>
              )}
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
                {timelineItems.map((item, index) => {
                  const tone = getCheckpointTone(item.status)
                  const isLast = index === timelineItems.length - 1

                  return (
                    <div key={item.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${tone.dot}`} />
                        {!isLast && <div className="bg-border h-full w-px" />}
                      </div>
                      <div className={isLast ? "" : "pb-4"}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{item.location_name}</p>
                          <Badge variant="outline" className={tone.badge}>
                            {formatStatusLabel(item.status)}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {formatDateTime(item.timestamp)}
                        </p>
                        {item.notes && (
                          <p className="text-muted-foreground mt-1 text-sm">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
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
                <p className="text-muted-foreground text-sm">{shipment.customer.email}</p>
              </div>
              {shipment.customer.phone && (
                <div>
                  <p className="text-muted-foreground text-sm">Phone</p>
                  <p className="text-sm">{shipment.customer.phone}</p>
                </div>
              )}
              {shipment.customer.address && (
                <div>
                  <p className="text-muted-foreground text-sm">Address</p>
                  <p className="text-sm">{shipment.customer.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {shipment.order && (
            <Card
              className="cursor-pointer transition-shadow hover:shadow-md"
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
                  <Badge
                    variant="outline"
                    className={priorityColors[shipment.order.priority] || priorityColors.medium}
                  >
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
                    <p className="font-medium">
                      {formatDateTime(shipment.order.created_at).split(",")[0]}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground pt-2 text-center text-xs">
                  Click to view order details
                </p>
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
