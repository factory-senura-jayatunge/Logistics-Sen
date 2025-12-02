"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Package,
  MapPin,
  DollarSign,
  AlertTriangle,
  Clock,
  Warehouse,
  BarChart3,
  Tag,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { getInventoryItem, type InventoryItem } from "@/lib/api"

const statusColors: Record<string, string> = {
  in_stock: "bg-green-500/10 text-green-600 border-green-200",
  low_stock: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  out_of_stock: "bg-red-500/10 text-red-600 border-red-200",
}

const statusIcons: Record<string, React.ReactNode> = {
  in_stock: <TrendingUp className="h-4 w-4 text-green-500" />,
  low_stock: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  out_of_stock: <TrendingDown className="h-4 w-4 text-red-500" />,
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

export default function InventoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true)
        const id = parseInt(params.id as string)
        if (isNaN(id)) {
          setError("Invalid item ID")
          return
        }
        const data = await getInventoryItem(id)
        setItem(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inventory item")
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
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
            <h2 className="text-lg font-semibold">Failed to load inventory item</h2>
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

  if (!item) return null

  const stockLevel = item.reorder_point > 0 
    ? Math.min((item.quantity / (item.reorder_point * 2)) * 100, 100) 
    : 100
  const stockValue = item.quantity * item.unit_price

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/inventory">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{item.name}</h1>
              <Badge variant="outline" className={statusColors[item.status] || statusColors.in_stock}>
                {item.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              SKU: {item.sku}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit Item</Button>
          <Button>Reorder Stock</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Stock Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Package className="h-3 w-3" /> Current Stock
                  </p>
                  <p className="text-2xl font-bold">{item.quantity.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">units</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Reorder Point
                  </p>
                  <p className="text-2xl font-bold">{item.reorder_point.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">units</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Unit Price
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency(item.unit_price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Stock Value
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency(stockValue)}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stock Level</span>
                  <div className="flex items-center gap-2">
                    {statusIcons[item.status]}
                    <span className="text-sm text-muted-foreground capitalize">
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={stockLevel} 
                  className={`h-3 ${
                    item.status === "out_of_stock" 
                      ? "[&>div]:bg-red-500" 
                      : item.status === "low_stock" 
                        ? "[&>div]:bg-yellow-500" 
                        : "[&>div]:bg-green-500"
                  }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>Reorder: {item.reorder_point}</span>
                  <span>Target: {item.reorder_point * 2}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
              <CardDescription>Recent inventory changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <div className="h-full w-px bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Item Created</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(item.created_at)}</p>
                  </div>
                </div>
                {item.updated_at !== item.created_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <div className="h-full w-px bg-border" />
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDateTime(item.updated_at)}</p>
                    </div>
                  </div>
                )}
                {item.status === "low_stock" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-yellow-600">Low Stock Alert</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity ({item.quantity}) is below reorder point ({item.reorder_point})
                      </p>
                    </div>
                  </div>
                )}
                {item.status === "out_of_stock" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-red-600">Out of Stock</p>
                      <p className="text-sm text-muted-foreground">
                        Item needs immediate restocking
                      </p>
                    </div>
                  </div>
                )}
                {item.status === "in_stock" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-green-600">Stock Healthy</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity is above reorder threshold
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/facilities")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Storage Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{item.facility?.name || "Unknown Facility"}</p>
                <p className="text-sm text-muted-foreground">Code: {item.facility?.code || "-"}</p>
              </div>
              {item.facility && (
                <>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{item.facility.address}</p>
                        <p className="text-muted-foreground">
                          {item.facility.city}, {item.facility.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">{item.facility.capacity_percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="capitalize">
                        {item.facility.status}
                      </Badge>
                    </div>
                  </div>
                </>
              )}
              <p className="text-xs text-muted-foreground text-center pt-2">Click to view facility</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Item Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item ID</span>
                <span className="font-medium">{item.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium font-mono">{item.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{item.category}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Facility ID</span>
                <span className="font-medium">{item.facility_id}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(item.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{formatDateTime(item.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
