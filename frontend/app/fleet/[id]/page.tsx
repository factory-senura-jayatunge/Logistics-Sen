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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getVehicle, type VehicleDetail } from "@/lib/api"
import {
  vehicleStatusColors,
  facilityTypeColors,
  formatDateTime,
} from "@/lib/utils"

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

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vehicle Type</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeLabels[vehicle.type] || vehicle.type}</div>
          </CardContent>
        </Card>
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
                  ? "[&>div]:bg-red-500"
                  : vehicle.fuel_level < 50
                    ? "[&>div]:bg-yellow-500"
                    : "[&>div]:bg-green-500"
              }`}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className={`text-lg px-3 py-1 ${vehicleStatusColors[vehicle.status]}`}>
              {vehicle.status.replace("_", " ")}
            </Badge>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Location</p>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    {vehicle.current_location}
                  </p>
                </div>
                {vehicle.destination && (
                  <>
                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px flex-1 bg-border" />
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Destination</p>
                      <p className="text-lg font-medium flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-green-500" />
                        {vehicle.destination}
                      </p>
                    </div>
                  </>
                )}
                {vehicle.eta && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-1">Estimated Arrival</p>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      {vehicle.eta}
                    </p>
                  </div>
                )}
                {!vehicle.destination && !vehicle.eta && vehicle.status === "idle" && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Vehicle is currently idle with no assigned route
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
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
                <span className="text-muted-foreground">Database ID</span>
                <span className="font-medium">{vehicle.id}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vehicle ID</span>
                <span className="font-medium">{vehicle.vehicle_id}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{vehicle.name}</span>
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
