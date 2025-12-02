"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Truck, Ship, Plane, Train, BarChart3, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getVehicles, type Vehicle } from "@/lib/api"
import { vehicleStatusColors } from "@/lib/utils"
import { VehicleModal } from "@/components/new-vehicle-modal"

const typeIcons: Record<string, React.ElementType> = {
  truck: Truck,
  ship: Ship,
  plane: Plane,
  train: Train,
}

export default function FleetPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(true)
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await getVehicles({
          type: typeFilter === "all" ? undefined : typeFilter,
          status: statusFilter === "all" ? undefined : statusFilter,
        })
        setVehicles(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load vehicles")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [typeFilter, statusFilter])

  const stats = {
    total: vehicles.length,
    enRoute: vehicles.filter((v) => v.status === "en_route").length,
    idle: vehicles.filter((v) => v.status === "idle").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Failed to load fleet</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet</h1>
          <p className="text-muted-foreground">Track and manage all vehicles and carriers</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="truck">Trucks</SelectItem>
              <SelectItem value="ship">Ships</SelectItem>
              <SelectItem value="plane">Aircraft</SelectItem>
              <SelectItem value="train">Trains</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="en_route">En Route</SelectItem>
              <SelectItem value="loading">Loading</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
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
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <VehicleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => {
          setModalOpen(false)
          setTypeFilter("all")
          setStatusFilter("all")
        }}
      />

      {showStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En Route</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.enRoute}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Idle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.idle}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.maintenance}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))
        ) : vehicles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No vehicles found matching the selected filters
          </div>
        ) : (
          vehicles.map((vehicle) => {
            const Icon = typeIcons[vehicle.type] || Truck
            return (
              <Card
                key={vehicle.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/fleet/${vehicle.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{vehicle.vehicle_id}</CardTitle>
                        <CardDescription className="text-xs">{vehicle.name}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={vehicleStatusColors[vehicle.status]}>
                      {vehicle.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Driver</span>
                      <span className="font-medium">{vehicle.driver}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium text-right max-w-[150px] truncate">{vehicle.current_location}</span>
                    </div>
                    {vehicle.destination && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Destination</span>
                        <span className="font-medium">{vehicle.destination}</span>
                      </div>
                    )}
                    {vehicle.eta && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ETA</span>
                        <span className="font-medium">
                          {new Date(vehicle.eta).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Fuel Level</span>
                      <span>{vehicle.fuel_level}%</span>
                    </div>
                    <Progress
                      value={vehicle.fuel_level}
                      className={`h-2 ${
                        vehicle.fuel_level < 30
                          ? "[&>div]:bg-destructive"
                          : vehicle.fuel_level < 50
                            ? "[&>div]:bg-warning"
                            : "[&>div]:bg-success"
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
