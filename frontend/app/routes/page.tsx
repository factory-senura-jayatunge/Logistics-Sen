"use client"

import { useEffect, useState } from "react"
import {
  Truck,
  Ship,
  Plane,
  Train,
  MapPin,
  Package,
  Navigation,
  Clock,
  AlertTriangle,
  Fuel,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getDispatchSummary,
  getOptimizedRoute,
  type DispatchSummary,
  type OptimizedRoute,
} from "@/lib/api"

const typeIcons: Record<string, React.ElementType> = {
  truck: Truck,
  ship: Ship,
  plane: Plane,
  train: Train,
}

export default function RoutesPage() {
  const [dispatch, setDispatch] = useState<DispatchSummary | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<OptimizedRoute | null>(null)
  const [loading, setLoading] = useState(true)
  const [routeLoading, setRouteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await getDispatchSummary()
        setDispatch(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dispatch data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleOptimizeRoute(vehicleId: number) {
    try {
      setRouteLoading(true)
      const route = await getOptimizedRoute(vehicleId)
      setSelectedRoute(route)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to optimize route")
    } finally {
      setRouteLoading(false)
    }
  }

  if (error && !dispatch) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">Failed to load dispatch data</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Route Planner</h1>
        <p className="text-muted-foreground">Optimize delivery routes and manage fleet dispatch</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Vehicles</CardTitle>
            <Truck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dispatch?.available_vehicles.length ?? 0}</div>
            <p className="text-muted-foreground text-xs">Ready for dispatch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Shipments</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dispatch?.pending_shipments_count ?? 0}</div>
            <p className="text-muted-foreground text-xs">Awaiting dispatch</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Regions</CardTitle>
            <MapPin className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dispatch?.regions.length ?? 0}</div>
            <p className="text-muted-foreground text-xs">Active destination regions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Available Vehicles</TabsTrigger>
          <TabsTrigger value="regions">Shipment Regions</TabsTrigger>
          {selectedRoute && <TabsTrigger value="route">Optimized Route</TabsTrigger>}
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Ready for Dispatch</CardTitle>
              <CardDescription>
                Select a vehicle to generate an optimized delivery route
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dispatch?.available_vehicles.map((vehicle) => {
                  const TypeIcon = typeIcons[vehicle.type] || Truck
                  return (
                    <Card key={vehicle.id} className="relative">
                      <CardContent className="pt-6">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                            <TypeIcon className="text-primary h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{vehicle.name}</p>
                            <p className="text-muted-foreground text-xs">{vehicle.vehicle_id}</p>
                          </div>
                        </div>
                        <div className="mb-3 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Driver</span>
                            <span>{vehicle.driver}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span className="text-right text-xs">{vehicle.current_location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Fuel className="h-3 w-3" /> Fuel
                            </span>
                            <div className="flex items-center gap-2">
                              <Progress value={vehicle.fuel_level} className="w-16" />
                              <span className="text-xs">{vehicle.fuel_level}%</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleOptimizeRoute(vehicle.id)}
                          disabled={routeLoading}
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          {routeLoading ? "Optimizing..." : "Optimize Route"}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
                {dispatch?.available_vehicles.length === 0 && (
                  <div className="col-span-full py-8 text-center">
                    <Truck className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground">No vehicles available for dispatch</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipments by Region</CardTitle>
              <CardDescription>Pending shipments grouped by destination region</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Shipments</TableHead>
                    <TableHead className="text-right">Total Weight (kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispatch?.regions.map((region) => (
                    <TableRow key={region.region}>
                      <TableCell className="font-medium">{region.region}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{region.count}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {region.total_weight_kg.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!dispatch?.regions || dispatch.regions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground text-center">
                        No pending shipments
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {selectedRoute && (
          <TabsContent value="route" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Optimized Route for {selectedRoute.vehicle.name}
                </CardTitle>
                <CardDescription>
                  Driver: {selectedRoute.vehicle.driver} | {selectedRoute.total_stops} stops |{" "}
                  {selectedRoute.total_distance_km.toLocaleString()} km |{" "}
                  <Clock className="mr-1 inline h-3 w-3" />
                  {selectedRoute.estimated_hours}h estimated
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRoute.message ? (
                  <p className="text-muted-foreground py-4 text-center">{selectedRoute.message}</p>
                ) : (
                  <div className="space-y-3">
                    {selectedRoute.stops.map((stop, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${stop.type === "origin" ? "bg-primary" : "bg-info"}`}
                          >
                            {stop.stop_order}
                          </div>
                          {index < selectedRoute.stops.length - 1 && (
                            <div className="bg-border my-1 h-6 w-px" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{stop.name}</p>
                          <p className="text-muted-foreground text-sm">{stop.location}</p>
                          {stop.tracking_number && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {stop.tracking_number}
                            </Badge>
                          )}
                        </div>
                        <Badge variant={stop.type === "origin" ? "default" : "secondary"}>
                          {stop.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
