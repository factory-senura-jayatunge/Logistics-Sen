import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import ShipmentsPage from "@/app/shipments/page"
import * as api from "@/lib/api"

vi.mock("@/lib/api")

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/shipments",
}))

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
  {
    id: 2,
    tracking_number: "SHP-2024-0002",
    order_id: 2,
    customer_id: 2,
    origin: "Chicago, IL",
    destination: "Miami, FL",
    carrier: "UPS",
    weight_kg: 15.0,
    status: "delivered",
    eta: null,
    created_at: "2024-03-10T08:00:00Z",
    updated_at: "2024-03-14T16:00:00Z",
    customer: {
      id: 2,
      name: "TechStart Inc",
      email: "orders@techstart.com",
      phone: "555-5678",
      address: "456 Tech Ave",
      created_at: "2024-01-15T00:00:00Z",
    },
  },
  {
    id: 3,
    tracking_number: "SHP-2024-0003",
    order_id: null,
    customer_id: 3,
    origin: "Seattle, WA",
    destination: "Denver, CO",
    carrier: "DHL",
    weight_kg: 50.0,
    status: "delayed",
    eta: "2024-03-22T12:00:00Z",
    created_at: "2024-03-12T11:00:00Z",
    updated_at: "2024-03-17T09:00:00Z",
    customer: {
      id: 3,
      name: "Global Logistics",
      email: "support@globallogistics.com",
      phone: "555-9999",
      address: "789 Global Blvd",
      created_at: "2024-02-01T00:00:00Z",
    },
  },
]

describe("ShipmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading state initially", () => {
    vi.mocked(api.getShipments).mockImplementation(() => new Promise(() => {}))

    render(<ShipmentsPage />)

    expect(screen.getByText("Shipments")).toBeInTheDocument()
  })

  it("renders shipments table after loading", async () => {
    vi.mocked(api.getShipments).mockResolvedValue(mockShipments)

    render(<ShipmentsPage />)

    await waitFor(() => {
      expect(screen.getByText("SHP-2024-0001")).toBeInTheDocument()
    })

    expect(screen.getByText("SHP-2024-0002")).toBeInTheDocument()
    expect(screen.getByText("SHP-2024-0003")).toBeInTheDocument()
  })

  it("displays customer names", async () => {
    vi.mocked(api.getShipments).mockResolvedValue(mockShipments)

    render(<ShipmentsPage />)

    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument()
    })

    expect(screen.getByText("TechStart Inc")).toBeInTheDocument()
    expect(screen.getByText("Global Logistics")).toBeInTheDocument()
  })

  it("displays origin and destination", async () => {
    vi.mocked(api.getShipments).mockResolvedValue(mockShipments)

    render(<ShipmentsPage />)

    await waitFor(() => {
      expect(screen.getByText("New York, NY")).toBeInTheDocument()
    })

    expect(screen.getByText("Los Angeles, CA")).toBeInTheDocument()
    expect(screen.getByText("Chicago, IL")).toBeInTheDocument()
    expect(screen.getByText("Miami, FL")).toBeInTheDocument()
  })

  it("displays carrier information", async () => {
    vi.mocked(api.getShipments).mockResolvedValue(mockShipments)

    render(<ShipmentsPage />)

    await waitFor(() => {
      expect(screen.getByText("FedEx")).toBeInTheDocument()
    })

    expect(screen.getByText("UPS")).toBeInTheDocument()
    expect(screen.getByText("DHL")).toBeInTheDocument()
  })

  it("displays status badges with correct text", async () => {
    vi.mocked(api.getShipments).mockResolvedValue(mockShipments)

    render(<ShipmentsPage />)

    await waitFor(() => {
      expect(screen.getByText("in transit")).toBeInTheDocument()
    })

    expect(screen.getByText("delivered")).toBeInTheDocument()
    expect(screen.getByText("delayed")).toBeInTheDocument()
  })

  it("displays weight information", async () => {
    vi.mocked(api.getShipments).mockResolvedValue(mockShipments)

    render(<ShipmentsPage />)

    await waitFor(() => {
      expect(screen.getByText("25.5 kg")).toBeInTheDocument()
    })

    expect(screen.getByText("15 kg")).toBeInTheDocument()
    expect(screen.getByText("50 kg")).toBeInTheDocument()
  })

  it("renders empty state when no shipments", async () => {
    vi.mocked(api.getShipments).mockResolvedValue([])

    render(<ShipmentsPage />)

    await waitFor(() => {
      expect(screen.getByText("No shipments found")).toBeInTheDocument()
    })
  })

  it("renders error state when API fails", async () => {
    vi.mocked(api.getShipments).mockRejectedValue(new Error("Failed to fetch shipments"))

    render(<ShipmentsPage />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load shipments/i)).toBeInTheDocument()
    })
  })

  it("calls getShipments on mount", async () => {
    vi.mocked(api.getShipments).mockResolvedValue(mockShipments)

    render(<ShipmentsPage />)

    await waitFor(() => {
      expect(api.getShipments).toHaveBeenCalled()
    })
  })
})
