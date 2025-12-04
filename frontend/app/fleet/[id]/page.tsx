"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Truck,
  Ship,
  Plane,
  Train,
  User,
  Fuel,
  Building2,
  AlertTriangle,
  Navigation,
  Clock,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Map, MapTileLayer, MapMarker, MapZoomControl, MapPolyline } from "@/components/ui/map"
import type { LatLngExpression } from "leaflet"
import { getVehicle, updateVehicle, type VehicleDetail } from "@/lib/api"
import {
  vehicleStatusColors,
  facilityTypeColors,
  formatDateTime,
} from "@/lib/utils"
import { getCoordinatesForLocation, interpolateRoute } from "@/lib/locations"
import { VehicleModal } from "@/components/new-vehicle-modal"

const typeIcons: Record<string, React.ElementType> = {
  truck: Truck,
  ship: Ship,
  plane: Plane,
  train: Train,
}

const typeLabels: Record<string, string> = {
  truck: "Truck",
  ship: "Ship",
  plane: "Aircraft",
  train: "Train",
}

function VehicleMap({ vehicle }: { vehicle: VehicleDetail }) {
  const currentCoords = getCoordinatesForLocation(vehicle.current_location)
  const destinationCoords = vehicle.destination
    ? getCoordinatesForLocation(vehicle.destination)
    : null

  const isEnRoute = vehicle.status === "en_route" && destinationCoords
  const showRouteLine = isEnRoute && vehicle.type !== "truck"
  const routePoints = showRouteLine && currentCoords && destinationCoords
    ? interpolateRoute(currentCoords, destinationCoords)
    : null

  const vehiclePosition = isEnRoute && currentCoords && destinationCoords
    ? [
        currentCoords[0] + (destinationCoords[0] - currentCoords[0]) * 0.4,
        currentCoords[1] + (destinationCoords[1] - currentCoords[1]) * 0.4,
      ] as [number, number]
    : currentCoords

  if (!currentCoords) {
    return (
      <div className="h-[250px] rounded-md bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Location coordinates not available</p>
      </div>
    )
  }

  const center: LatLngExpression = isEnRoute && destinationCoords && vehiclePosition
    ? [
        (Math.min(currentCoords[0], destinationCoords[0], vehiclePosition[0]) + 
         Math.max(currentCoords[0], destinationCoords[0], vehiclePosition[0])) / 2,
        (Math.min(currentCoords[1], destinationCoords[1], vehiclePosition[1]) + 
         Math.max(currentCoords[1], destinationCoords[1], vehiclePosition[1])) / 2,
      ]
    : currentCoords

  const zoom = (() => {
    if (!isEnRoute || !destinationCoords) return 10
    const latDiff = Math.abs(currentCoords[0] - destinationCoords[0])
    const lngDiff = Math.abs(currentCoords[1] - destinationCoords[1])
    const maxDiff = Math.max(latDiff, lngDiff)
    if (maxDiff > 30) return 3
    if (maxDiff > 15) return 4
    if (maxDiff > 8) return 5
    if (maxDiff > 4) return 6
    return 7
  })()

  const Icon = typeIcons[vehicle.type] || Truck

  return (
    <Map center={center} zoom={zoom} className="h-[250px]">
      <MapTileLayer />
      <MapZoomControl />

      {showRouteLine && routePoints && (
        <MapPolyline
          positions={routePoints as LatLngExpression[]}
          pathOptions={{
            color: "var(--color-info)",
            weight: 3,
            opacity: 0.7,
            dashArray: "10, 10",
          }}
        />
      )}

      <MapMarker
        position={currentCoords as LatLngExpression}
        icon={
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-info shadow-md border-2 border-background">
            <MapPin className="h-3 w-3 text-info-foreground" />
          </div>
        }
        iconAnchor={[12, 12]}
      />

      {isEnRoute && destinationCoords && (
        <MapMarker
          position={destinationCoords as LatLngExpression}
          icon={
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-success shadow-md border-2 border-background">
              <Navigation className="h-3 w-3 text-success-foreground" />
            </div>
          }
          iconAnchor={[12, 12]}
        />
      )}

      {vehiclePosition && (
        <MapMarker
          position={vehiclePosition as LatLngExpression}
          icon={
            <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-background ${
              vehicle.status === "en_route" ? "bg-info" :
              vehicle.status === "idle" ? "bg-neutral" :
              vehicle.status === "maintenance" ? "bg-warning" : "bg-info"
            }`}>
              <Icon className="h-4 w-4 text-background" />
            </div>
          }
          iconAnchor={[16, 16]}
        />
      )}
    </Map>
  )
}

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const refreshVehicle = async () => {
    const id = parseInt(params.id as string)
    const data = await getVehicle(id)
    setVehicle(data)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!vehicle || actionLoading) return
    setActionLoading(newStatus)
    try {
      await updateVehicle(vehicle.id, {
        vehicle_id: vehicle.vehicle_id,
        name: vehicle.name,
        type: vehicle.type,
        driver: vehicle.driver,
        facility_id: vehicle.facility_id ?? undefined,
        current_location: vehicle.current_location,
        destination: vehicle.destination ?? undefined,
        status: newStatus,
        fuel_level: vehicle.fuel_level,
      })
      await refreshVehicle()
    } catch (err) {
      console.error("Failed to update status:", err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRefuel = async () => {
    if (!vehicle || actionLoading) return
    setActionLoading("refuel")
    try {
      await updateVehicle(vehicle.id, {
        vehicle_id: vehicle.vehicle_id,
        name: vehicle.name,
        type: vehicle.type,
        driver: vehicle.driver,
        facility_id: vehicle.facility_id ?? undefined,
        current_location: vehicle.current_location,
        destination: vehicle.destination ?? undefined,
        status: vehicle.status,
        fuel_level: 100,
      })
      await refreshVehicle()
    } catch (err) {
      console.error("Failed to refuel:", err)
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    async function fetchVehicle() {
      try {
        setLoading(true)
        const id = parseInt(params.id as string)
        if (isNaN(id)) {
          setError("Invalid vehicle ID")
          return
        }
        const data = await getVehicle(id)
        setVehicle(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load vehicle")
      } finally {
        setLoading(false)
      }
    }
    fetchVehicle()
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
            <h2 className="text-lg font-semibold">Failed to load vehicle</h2>
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

  if (!vehicle) return null

  const Icon = typeIcons[vehicle.type] || Truck

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/fleet">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-muted">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{vehicle.vehicle_id}</h1>
                <Badge variant="outline" className={vehicleStatusColors[vehicle.status]}>
                  {vehicle.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-muted-foreground">{vehicle.name}</p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setEditModalOpen(true)}>
          Edit Vehicle
        </Button>
      </div>

      <VehicleModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        vehicle={vehicle}
        onSuccess={refreshVehicle}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Driver</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{vehicle.driver}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fuel Level</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicle.fuel_level}%</div>
            <Progress
              value={vehicle.fuel_level}
              className={`h-2 mt-2 ${
                vehicle.fuel_level < 30
                  ? "[&>div]:bg-destructive"
                  : vehicle.fuel_level < 50
                    ? "[&>div]:bg-warning"
                    : "[&>div]:bg-success"
              }`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Route
              </CardTitle>
              <CardDescription>
                {vehicle.status === "en_route" && vehicle.destination
                  ? `En route from ${vehicle.current_location} to ${vehicle.destination}`
                  : `Current location: ${vehicle.current_location}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <VehicleMap vehicle={vehicle} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Location</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-info" />
                    {vehicle.current_location}
                  </p>
                </div>
                {vehicle.destination && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Destination</p>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-success" />
                      {vehicle.destination}
                    </p>
                  </div>
                )}
              </div>
              {vehicle.eta && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estimated Arrival</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    {vehicle.eta}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Set Status</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={vehicle.status === "en_route" ? "default" : "outline"}
                    onClick={() => handleStatusChange("en_route")}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "en_route" ? "..." : "En Route"}
                  </Button>
                  <Button
                    size="sm"
                    variant={vehicle.status === "idle" ? "default" : "outline"}
                    onClick={() => handleStatusChange("idle")}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "idle" ? "..." : "Idle"}
                  </Button>
                  <Button
                    size="sm"
                    variant={vehicle.status === "maintenance" ? "default" : "outline"}
                    onClick={() => handleStatusChange("maintenance")}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === "maintenance" ? "..." : "Maintenance"}
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Fuel</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefuel}
                  disabled={actionLoading !== null || vehicle.fuel_level === 100}
                  className="w-full"
                >
                  <Fuel className="h-4 w-4 mr-2" />
                  {actionLoading === "refuel" ? "Refueling..." : "Mark as Refueled"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {vehicle.facility ? (
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/facilities/${vehicle.facility!.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Assigned Facility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{vehicle.facility.name}</p>
                  <Badge variant="outline" className={facilityTypeColors[vehicle.facility.type]}>
                    {vehicle.facility.type}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code</span>
                    <span className="font-medium">{vehicle.facility.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{vehicle.facility.city}, {vehicle.facility.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{vehicle.facility.capacity_percentage}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-2">Click to view facility details</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Assigned Facility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                  No facility assigned to this vehicle
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{typeLabels[vehicle.type] || vehicle.type}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDateTime(vehicle.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
