"use client"

import { useEffect, useState } from "react"
import {
  Package,
  Clock,
  AlertTriangle,
  Truck,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  getDashboardStats,
  getRecentShipments,
  getShipmentStatusBreakdown,
  getShipmentVolume,
  type DashboardStats,
  type Shipment,
  type ShipmentStatusBreakdown,
  type ShipmentVolumeData,
} from "@/lib/api"
import { formatTimeAgo } from "@/lib/utils"

const statusColors: Record<string, string> = {
  delivered: "bg-green-500/10 text-green-600 border-green-200",
  in_transit: "bg-blue-500/10 text-blue-600 border-blue-200",
  delayed: "bg-red-500/10 text-red-600 border-red-200",
  processing: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  pending: "bg-gray-500/10 text-gray-600 border-gray-200",
}

const statusChartColors: Record<string, string> = {
  delivered: "var(--chart-2)",
  in_transit: "var(--chart-1)",
  delayed: "var(--chart-5)",
  processing: "var(--chart-3)",
  pending: "var(--chart-4)",
}

const shipmentVolumeConfig = {
  count: {
    label: "Shipments",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const statusBreakdownConfig = {
  count: {
    label: "Shipments",
  },
  delivered: {
    label: "Delivered",
    color: "var(--chart-2)",
  },
  in_transit: {
    label: "In Transit",
    color: "var(--chart-1)",
  },
  delayed: {
    label: "Delayed",
    color: "var(--chart-5)",
  },
  processing: {
    label: "Processing",
    color: "var(--chart-3)",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<ShipmentStatusBreakdown[]>([])
  const [shipmentVolume, setShipmentVolume] = useState<ShipmentVolumeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [statsData, shipmentsData, statusData, volumeData] = await Promise.all([
          getDashboardStats(),
          getRecentShipments(5),
          getShipmentStatusBreakdown(),
          getShipmentVolume(30),
        ])
        setStats(statsData)
        setRecentShipments(shipmentsData)
        setStatusBreakdown(statusData)
        setShipmentVolume(volumeData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">Make sure the backend is running on port 8000</p>
        </div>
      </div>
    )
  }

  const kpiData = stats ? [
    {
      title: "Total Shipments",
      value: stats.total_shipments.toLocaleString(),
      subtitle: `${stats.shipments_in_transit} in transit`,
      icon: Package,
    },
    {
      title: "On-Time Rate",
      value: stats.total_shipments > 0 
        ? `${(((stats.total_shipments - stats.shipments_delayed) / stats.total_shipments) * 100).toFixed(1)}%`
        : "N/A",
      subtitle: `${stats.shipments_delivered} delivered`,
      icon: Clock,
    },
    {
      title: "Active Vehicles",
      value: stats.vehicles_en_route.toString(),
      subtitle: `of ${stats.total_vehicles} total`,
      icon: Truck,
    },
    {
      title: "Low Stock Items",
      value: stats.low_stock_items.toString(),
      subtitle: `of ${stats.total_inventory_items} items`,
      icon: AlertTriangle,
      alert: stats.low_stock_items > 0,
    },
  ] : []

  const statusBreakdownData = statusBreakdown.map((item) => ({
    status: item.status,
    count: item.count,
    fill: statusChartColors[item.status] || "var(--chart-1)",
  }))

  const volumeChartData = shipmentVolume.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: item.count,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your logistics operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpiData.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.alert ? "text-destructive" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${kpi.alert ? "text-destructive" : ""}`}>{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipment Volume</CardTitle>
            <CardDescription>Daily shipments over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={shipmentVolumeConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={volumeChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipment Status Breakdown</CardTitle>
            <CardDescription>Distribution of all shipment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusBreakdownConfig} className="min-h-[200px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                <Pie
                  data={statusBreakdownData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                />
                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest shipment updates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{shipment.tracking_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {shipment.customer.name} → {shipment.destination}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={statusColors[shipment.status] || statusColors.pending}>
                      {shipment.status.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      {formatTimeAgo(shipment.updated_at)}
                    </span>
                  </div>
                </div>
              ))}
              {recentShipments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent shipments</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
