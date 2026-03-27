import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import DashboardPage from "@/app/dashboard/page"
import * as api from "@/lib/api"

vi.mock("@/lib/api")

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>()
  return {
    ...actual,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  }
})

const mockStats: api.DashboardStats = {
  total_shipments: 150,
  shipments_in_transit: 45,
  shipments_delivered: 80,
  shipments_delayed: 5,
  total_orders: 200,
  orders_pending: 25,
  total_inventory_items: 500,
  low_stock_items: 12,
  total_vehicles: 30,
  vehicles_en_route: 15,
  total_facilities: 8,
}

const mockShipments: api.Shipment[] = [
  {
    id: 1,
    tracking_number: "SHP-2024-0001",
    order_id: 1,
    customer_id: 1,
    origin: "New York, NY",
    destination: "Los Angeles, CA",
    carrier: "FedEx",
    weight_kg: 25.5,
    status: "in_transit",
    eta: "2024-03-20T10:00:00Z",
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-03-16T14:00:00Z",
    customer: {
      id: 1,
      name: "Acme Corp",
      email: "contact@acme.com",
      phone: "555-1234",
      address: "123 Main St",
      created_at: "2024-01-01T00:00:00Z",
    },
  },
]

const mockStatusBreakdown: api.ShipmentStatusBreakdown[] = [
  { status: "delivered", count: 80 },
  { status: "in_transit", count: 45 },
  { status: "delayed", count: 5 },
]

const mockVolume: api.ShipmentVolumeData[] = [
  { date: "2024-03-01", count: 10 },
  { date: "2024-03-02", count: 15 },
]

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading state initially", () => {
    vi.mocked(api.getDashboardStats).mockImplementation(() => new Promise(() => {}))
    vi.mocked(api.getRecentShipments).mockImplementation(() => new Promise(() => {}))
    vi.mocked(api.getShipmentStatusBreakdown).mockImplementation(() => new Promise(() => {}))
    vi.mocked(api.getShipmentVolume).mockImplementation(() => new Promise(() => {}))

    render(<DashboardPage />)

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Overview of your logistics operations")).toBeInTheDocument()
  })

  it("renders dashboard stats after loading", async () => {
    vi.mocked(api.getDashboardStats).mockResolvedValue(mockStats)
    vi.mocked(api.getRecentShipments).mockResolvedValue(mockShipments)
    vi.mocked(api.getShipmentStatusBreakdown).mockResolvedValue(mockStatusBreakdown)
    vi.mocked(api.getShipmentVolume).mockResolvedValue(mockVolume)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText("Total Shipments")).toBeInTheDocument()
    })

    expect(screen.getByText("150")).toBeInTheDocument()
    expect(screen.getByText("45 in transit")).toBeInTheDocument()
    expect(screen.getByText("On-Time Rate")).toBeInTheDocument()
    expect(screen.getByText("Active Vehicles")).toBeInTheDocument()
    expect(screen.getByText("Low Stock Items")).toBeInTheDocument()
  })

  it("renders recent shipments section", async () => {
    vi.mocked(api.getDashboardStats).mockResolvedValue(mockStats)
    vi.mocked(api.getRecentShipments).mockResolvedValue(mockShipments)
    vi.mocked(api.getShipmentStatusBreakdown).mockResolvedValue(mockStatusBreakdown)
    vi.mocked(api.getShipmentVolume).mockResolvedValue(mockVolume)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText("Recent Activity")).toBeInTheDocument()
    })

    expect(screen.getByText("SHP-2024-0001")).toBeInTheDocument()
    expect(screen.getByText(/Acme Corp/)).toBeInTheDocument()
  })

  it("renders error state when API fails", async () => {
    vi.mocked(api.getDashboardStats).mockRejectedValue(new Error("API Error"))
    vi.mocked(api.getRecentShipments).mockRejectedValue(new Error("API Error"))
    vi.mocked(api.getShipmentStatusBreakdown).mockRejectedValue(new Error("API Error"))
    vi.mocked(api.getShipmentVolume).mockRejectedValue(new Error("API Error"))

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText("Failed to load dashboard")).toBeInTheDocument()
    })

    expect(screen.getByText("API Error")).toBeInTheDocument()
  })

  it("renders chart sections", async () => {
    vi.mocked(api.getDashboardStats).mockResolvedValue(mockStats)
    vi.mocked(api.getRecentShipments).mockResolvedValue(mockShipments)
    vi.mocked(api.getShipmentStatusBreakdown).mockResolvedValue(mockStatusBreakdown)
    vi.mocked(api.getShipmentVolume).mockResolvedValue(mockVolume)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText("Shipment Volume")).toBeInTheDocument()
    })

    expect(screen.getByText("Shipment Status Breakdown")).toBeInTheDocument()
    expect(screen.getByText("Daily shipments over the last 30 days")).toBeInTheDocument()
  })

  it("displays low stock alert when items are low", async () => {
    vi.mocked(api.getDashboardStats).mockResolvedValue(mockStats)
    vi.mocked(api.getRecentShipments).mockResolvedValue(mockShipments)
    vi.mocked(api.getShipmentStatusBreakdown).mockResolvedValue(mockStatusBreakdown)
    vi.mocked(api.getShipmentVolume).mockResolvedValue(mockVolume)

    render(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText("12")).toBeInTheDocument()
    })

    expect(screen.getByText("of 500 items")).toBeInTheDocument()
  })
})
