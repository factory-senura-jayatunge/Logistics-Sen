"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, MapPin, BarChart3, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Map, MapTileLayer, MapMarker, MapZoomControl, MapPopup } from "@/components/ui/map"
import type { LatLngExpression } from "leaflet"
import { Building2 } from "lucide-react"
import { getFacilities, type Facility } from "@/lib/api"
import { facilityTypeColors, facilityStatusColors } from "@/lib/utils"

export default function FacilitiesPage() {
  const router = useRouter()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await getFacilities()
        setFacilities(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load facilities")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = {
    total: facilities.length,
    operational: facilities.filter((f) => f.status === "operational").length,
    maintenance: facilities.filter((f) => f.status === "maintenance").length,
    avgCapacity:
      facilities.length > 0
        ? Math.round(
            facilities.reduce((sum, f) => sum + f.capacity_percentage, 0) / facilities.length
          )
        : 0,
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">Failed to load facilities</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facilities</h1>
          <p className="text-muted-foreground">Manage warehouses, hubs, and distribution centers</p>
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Facility
          </Button>
        </div>
      </div>

      {showStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total Facilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Operational
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-success text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.operational}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Under Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-warning text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.maintenance}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Avg. Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : `${stats.avgCapacity}%`}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Global Network Map</CardTitle>
          <CardDescription>Interactive map of all facilities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full rounded-md" />
          ) : (
            <Map
              center={[39.8283, -98.5795] satisfies LatLngExpression}
              zoom={4}
              className="h-[300px]"
            >
              <MapTileLayer />
              <MapZoomControl />
              {facilities
                .filter((f) => f.latitude && f.longitude)
                .map((facility) => (
                  <MapMarker
                    key={facility.id}
                    position={[facility.latitude!, facility.longitude!] satisfies LatLngExpression}
                    icon={
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full shadow-md ${
                          facility.status === "operational"
                            ? "bg-success"
                            : facility.status === "maintenance"
                              ? "bg-warning"
                              : "bg-destructive"
                        }`}
                      >
                        <Building2 className="text-background h-4 w-4" />
                      </div>
                    }
                    iconAnchor={[14, 14]}
                  >
                    <MapPopup>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold">{facility.name}</span>
                          <Badge
                            variant="outline"
                            className={facilityStatusColors[facility.status]}
                          >
                            {facility.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {facility.city}, {facility.state}
                        </p>
                        <div className="flex justify-between text-sm">
                          <span>Capacity:</span>
                          <span className="font-medium">{facility.capacity_percentage}%</span>
                        </div>
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => router.push(`/facilities/${facility.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </MapPopup>
                  </MapMarker>
                ))}
            </Map>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="mt-2 h-6 w-48" />
                  <Skeleton className="mt-1 h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <Skeleton className="mt-4 h-2 w-full" />
                </CardContent>
              </Card>
            ))
          : facilities.map((facility) => (
              <Card
                key={facility.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/facilities/${facility.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={facilityTypeColors[facility.type]}>
                      {facility.type}
                    </Badge>
                    <Badge variant="outline" className={facilityStatusColors[facility.status]}>
                      {facility.status}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 text-lg">{facility.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {facility.city}, {facility.state}, {facility.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{facility.capacity_percentage}%</div>
                      <div className="text-muted-foreground text-xs">Capacity</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{facility.staff_count}</div>
                      <div className="text-muted-foreground text-xs">Staff</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Capacity Utilization</span>
                      <span>{facility.capacity_percentage}%</span>
                    </div>
                    <Progress
                      value={facility.capacity_percentage}
                      className={`h-2 ${
                        facility.capacity_percentage > 80
                          ? "[&>div]:bg-destructive"
                          : facility.capacity_percentage > 60
                            ? "[&>div]:bg-warning"
                            : "[&>div]:bg-success"
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
