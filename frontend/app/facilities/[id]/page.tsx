"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Users,
  Package,
  Truck,
  AlertTriangle,
  Building2,
  Gauge,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getFacility, type FacilityDetail } from "@/lib/api"
import {
  facilityTypeColors,
  facilityStatusColors,
  inventoryStatusColors,
  vehicleStatusColors,
  formatCurrency,
} from "@/lib/utils"

export default function FacilityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [facility, setFacility] = useState<FacilityDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFacility() {
      try {
        setLoading(true)
        const id = parseInt(params.id as string)
        if (isNaN(id)) {
          setError("Invalid facility ID")
          return
        }
        const data = await getFacility(id)
        setFacility(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load facility")
      } finally {
        setLoading(false)
      }
    }
    fetchFacility()
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
            <h2 className="text-lg font-semibold">Failed to load facility</h2>
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

  if (!facility) return null

  const inventoryStats = {
    total: facility.inventory_items.length,
    lowStock: facility.inventory_items.filter((i) => i.status === "low_stock").length,
    outOfStock: facility.inventory_items.filter((i) => i.status === "out_of_stock").length,
    totalValue: facility.inventory_items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0),
  }

  const vehicleStats = {
    total: facility.vehicles.length,
    enRoute: facility.vehicles.filter((v) => v.status === "en_route").length,
    idle: facility.vehicles.filter((v) => v.status === "idle").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/facilities">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{facility.name}</h1>
              <Badge variant="outline" className={facilityTypeColors[facility.type]}>
                {facility.type}
              </Badge>
              <Badge variant="outline" className={facilityStatusColors[facility.status]}>
                {facility.status}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {facility.address}, {facility.city}, {facility.state}, {facility.country}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Facility Code</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facility.code}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capacity</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facility.capacity_percentage}%</div>
            <Progress
              value={facility.capacity_percentage}
              className={`h-2 mt-2 ${
                facility.capacity_percentage > 80
                  ? "[&>div]:bg-red-500"
                  : facility.capacity_percentage > 60
                    ? "[&>div]:bg-yellow-500"
                    : "[&>div]:bg-green-500"
              }`}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Staff Count</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facility.staff_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryStats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Items
                </CardTitle>
                <CardDescription>
                  {inventoryStats.total} items • {inventoryStats.lowStock > 0 && (
                    <span className="text-yellow-600">{inventoryStats.lowStock} low stock</span>
                  )}
                  {inventoryStats.lowStock > 0 && inventoryStats.outOfStock > 0 && " • "}
                  {inventoryStats.outOfStock > 0 && (
                    <span className="text-red-600">{inventoryStats.outOfStock} out of stock</span>
                  )}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/inventory?facility=${facility.id}`}>View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {facility.inventory_items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No inventory items at this facility</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facility.inventory_items.slice(0, 5).map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/inventory/${item.id}`)}
                    >
                      <TableCell className="font-medium">{item.sku}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={inventoryStatusColors[item.status]}>
                          {item.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {facility.inventory_items.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-4">
                +{facility.inventory_items.length - 5} more items
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Vehicles
                </CardTitle>
                <CardDescription>
                  {vehicleStats.total} vehicles • {vehicleStats.enRoute} en route • {vehicleStats.idle} idle
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/fleet">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {facility.vehicles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No vehicles assigned to this facility</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Fuel</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facility.vehicles.slice(0, 5).map((vehicle) => (
                    <TableRow
                      key={vehicle.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/fleet/${vehicle.id}`)}
                    >
                      <TableCell className="font-medium">{vehicle.vehicle_id}</TableCell>
                      <TableCell className="max-w-[120px] truncate">{vehicle.driver}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={vehicle.fuel_level}
                            className={`h-2 w-16 ${
                              vehicle.fuel_level < 30
                                ? "[&>div]:bg-red-500"
                                : vehicle.fuel_level < 50
                                  ? "[&>div]:bg-yellow-500"
                                  : "[&>div]:bg-green-500"
                            }`}
                          />
                          <span className="text-xs">{vehicle.fuel_level}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={vehicleStatusColors[vehicle.status]}>
                          {vehicle.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {facility.vehicles.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-4">
                +{facility.vehicles.length - 5} more vehicles
              </p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
