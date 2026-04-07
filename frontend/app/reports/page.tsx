"use client"

import { useEffect, useState } from "react"
import { Download, AlertTriangle, TrendingUp, Truck, Building2, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  getDeliveryTrends,
  getCarrierPerformance,
  getFacilityUtilization,
  getCustomerOrderFrequency,
  getAnalyticsCsvUrl,
  type DeliveryTrend,
  type CarrierPerformance,
  type FacilityUtilization,
  type CustomerOrderFrequency,
} from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

const deliveryTrendConfig = {
  on_time_rate: {
    label: "On-Time Rate (%)",
    color: "var(--chart-2)",
  },
  total: {
    label: "Total Shipments",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const carrierConfig = {
  total_shipments: {
    label: "Total Shipments",
    color: "var(--chart-1)",
  },
  delivered: {
    label: "Delivered",
    color: "var(--chart-2)",
  },
  delayed: {
    label: "Delayed",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const customerConfig = {
  order_count: {
    label: "Orders",
    color: "var(--chart-1)",
  },
  total_value: {
    label: "Total Value ($)",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const capacityBarColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const facilityCapacityConfig = {
  capacity_percentage: {
    label: "Capacity %",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const facilityStatusColors: Record<string, string> = {
  operational: "bg-success/10 text-success border-success/20",
  maintenance: "bg-warning/10 text-warning border-warning/20",
  offline: "bg-destructive/10 text-destructive border-destructive/20",
}

function handleExport(report: string) {
  window.open(getAnalyticsCsvUrl(report), "_blank")
}

export default function ReportsPage() {
  const [deliveryTrends, setDeliveryTrends] = useState<DeliveryTrend[]>([])
  const [carrierPerf, setCarrierPerf] = useState<CarrierPerformance[]>([])
  const [facilityUtil, setFacilityUtil] = useState<FacilityUtilization[]>([])
  const [customerFreq, setCustomerFreq] = useState<CustomerOrderFrequency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [trends, carriers, facilities, customers] = await Promise.all([
          getDeliveryTrends(90),
          getCarrierPerformance(),
          getFacilityUtilization(),
          getCustomerOrderFrequency(10),
        ])
        setDeliveryTrends(trends)
        setCarrierPerf(carriers)
        setFacilityUtil(facilities)
        setCustomerFreq(customers)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="text-destructive mx-auto mb-4 h-12 w-12" />
          <h2 className="text-lg font-semibold">Failed to load reports</h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Make sure the backend is running on port 8000
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Performance metrics, trends, and operational insights
          </p>
        </div>
      </div>

      <Tabs defaultValue="delivery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="delivery" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Delivery Trends
          </TabsTrigger>
          <TabsTrigger value="carriers" className="gap-2">
            <Truck className="h-4 w-4" />
            Carrier Performance
          </TabsTrigger>
          <TabsTrigger value="facilities" className="gap-2">
            <Building2 className="h-4 w-4" />
            Facility Utilization
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="h-4 w-4" />
            Customer Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="delivery" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => handleExport("delivery-trends")}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      Average On-Time Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {deliveryTrends.length > 0
                        ? `${(deliveryTrends.reduce((sum, t) => sum + t.on_time_rate, 0) / deliveryTrends.length).toFixed(1)}%`
                        : "N/A"}
                    </div>
                    <p className="text-muted-foreground text-xs">Last 90 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      Total Shipments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {deliveryTrends.reduce((sum, t) => sum + t.total, 0).toLocaleString()}
                    </div>
                    <p className="text-muted-foreground text-xs">Last 90 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      Total Delayed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-destructive text-2xl font-bold">
                      {deliveryTrends.reduce((sum, t) => sum + t.delayed, 0).toLocaleString()}
                    </div>
                    <p className="text-muted-foreground text-xs">Last 90 days</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>On-Time Delivery Rate Trend</CardTitle>
                  <CardDescription>
                    Weekly on-time delivery rates over the last 90 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={deliveryTrendConfig} className="min-h-[300px] w-full">
                    <LineChart accessibilityLayer data={deliveryTrends}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line
                        type="monotone"
                        dataKey="on_time_rate"
                        stroke="var(--color-on_time_rate)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="carriers" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => handleExport("carrier-performance")}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Carrier Shipment Comparison</CardTitle>
                  <CardDescription>
                    Shipment counts by carrier: delivered, delayed, and total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={carrierConfig} className="min-h-[300px] w-full">
                    <BarChart accessibilityLayer data={carrierPerf}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="carrier" tickLine={false} tickMargin={10} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="delivered" fill="var(--color-delivered)" radius={4} />
                      <Bar dataKey="delayed" fill="var(--color-delayed)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Carrier Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Carrier</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Delivered</TableHead>
                        <TableHead className="text-right">Delayed</TableHead>
                        <TableHead className="text-right">In Transit</TableHead>
                        <TableHead className="text-right">Avg Weight</TableHead>
                        <TableHead className="text-right">On-Time Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carrierPerf.map((c) => (
                        <TableRow key={c.carrier}>
                          <TableCell className="font-medium">{c.carrier}</TableCell>
                          <TableCell className="text-right">{c.total_shipments}</TableCell>
                          <TableCell className="text-right">{c.delivered}</TableCell>
                          <TableCell className="text-right">{c.delayed}</TableCell>
                          <TableCell className="text-right">{c.in_transit}</TableCell>
                          <TableCell className="text-right">{c.avg_weight} kg</TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className={
                                c.on_time_rate >= 90
                                  ? "bg-success/10 text-success border-success/20"
                                  : c.on_time_rate >= 70
                                    ? "bg-warning/10 text-warning border-warning/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                              }
                            >
                              {c.on_time_rate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("facility-utilization")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Facility Capacity Overview</CardTitle>
                  <CardDescription>Capacity utilization across all facilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={facilityCapacityConfig} className="min-h-[300px] w-full">
                    <BarChart
                      accessibilityLayer
                      data={facilityUtil}
                      layout="vertical"
                      margin={{ left: 80 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} />
                      <YAxis
                        dataKey="code"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={70}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="capacity_percentage" radius={4}>
                        {facilityUtil.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={capacityBarColors[index % capacityBarColors.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                {facilityUtil.map((f) => (
                  <Card key={f.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{f.name}</CardTitle>
                        <Badge variant="outline" className={facilityStatusColors[f.status] || ""}>
                          {f.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {f.code} - {f.type} - {f.city}, {f.state}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-muted-foreground">Capacity</span>
                          <span className="font-medium">{f.capacity_percentage}%</span>
                        </div>
                        <Progress value={f.capacity_percentage} className="h-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Staff</p>
                          <p className="font-medium">{f.staff_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Items</p>
                          <p className="font-medium">{f.inventory_items}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Vehicles</p>
                          <p className="font-medium">{f.vehicles}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("customer-order-frequency")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers by Order Count</CardTitle>
                  <CardDescription>
                    Most active customers ranked by number of orders placed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={customerConfig} className="min-h-[300px] w-full">
                    <BarChart accessibilityLayer data={customerFreq}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="customer_name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="order_count" fill="var(--color-order_count)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Order Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                        <TableHead className="text-right">Avg Order Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerFreq.map((c) => (
                        <TableRow key={c.customer_id}>
                          <TableCell className="font-medium">{c.customer_name}</TableCell>
                          <TableCell className="text-right">{c.order_count}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(c.total_value)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(c.avg_order_value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
