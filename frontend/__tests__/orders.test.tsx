import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import OrdersPage from "@/app/orders/page"
import * as api from "@/lib/api"

vi.mock("@/lib/api")

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/orders",
}))

const mockOrders: api.Order[] = [
  {
    id: 1,
    order_number: "ORD-2024-0001",
    customer_id: 1,
    items_count: 5,
    total_value: 299.99,
    priority: "high",
    status: "processing",
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
    order_number: "ORD-2024-0002",
    customer_id: 2,
    items_count: 3,
    total_value: 149.5,
    priority: "medium",
    status: "pending",
    created_at: "2024-03-14T09:00:00Z",
    updated_at: "2024-03-14T09:00:00Z",
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
    order_number: "ORD-2024-0003",
    customer_id: 3,
    items_count: 10,
    total_value: 999.0,
    priority: "critical",
    status: "shipped",
    created_at: "2024-03-13T08:00:00Z",
    updated_at: "2024-03-15T12:00:00Z",
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

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading state initially", () => {
    vi.mocked(api.getOrders).mockImplementation(() => new Promise(() => {}))

    render(<OrdersPage />)

    expect(screen.getByText("Orders")).toBeInTheDocument()
  })

  it("renders orders table after loading", async () => {
    vi.mocked(api.getOrders).mockResolvedValue(mockOrders)

    render(<OrdersPage />)

    await waitFor(() => {
      expect(screen.getByText("ORD-2024-0001")).toBeInTheDocument()
    })

    expect(screen.getByText("ORD-2024-0002")).toBeInTheDocument()
    expect(screen.getByText("ORD-2024-0003")).toBeInTheDocument()
  })

  it("displays customer names", async () => {
    vi.mocked(api.getOrders).mockResolvedValue(mockOrders)

    render(<OrdersPage />)

    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument()
    })

    expect(screen.getByText("TechStart Inc")).toBeInTheDocument()
    expect(screen.getByText("Global Logistics")).toBeInTheDocument()
  })

  it("displays order values formatted as currency", async () => {
    vi.mocked(api.getOrders).mockResolvedValue(mockOrders)

    render(<OrdersPage />)

    await waitFor(() => {
      expect(screen.getByText("$300")).toBeInTheDocument()
    })

    expect(screen.getByText("$150")).toBeInTheDocument()
    expect(screen.getByText("$999")).toBeInTheDocument()
  })

  it("displays priority badges", async () => {
    vi.mocked(api.getOrders).mockResolvedValue(mockOrders)

    render(<OrdersPage />)

    await waitFor(() => {
      expect(screen.getByText("high")).toBeInTheDocument()
    })

    expect(screen.getByText("medium")).toBeInTheDocument()
    expect(screen.getByText("critical")).toBeInTheDocument()
  })

  it("displays status badges", async () => {
    vi.mocked(api.getOrders).mockResolvedValue(mockOrders)

    render(<OrdersPage />)

    await waitFor(() => {
      expect(screen.getByText("processing")).toBeInTheDocument()
    })

    expect(screen.getByText("pending")).toBeInTheDocument()
    expect(screen.getByText("shipped")).toBeInTheDocument()
  })

  it("displays items count", async () => {
    vi.mocked(api.getOrders).mockResolvedValue(mockOrders)

    render(<OrdersPage />)

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument()
    })

    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("10")).toBeInTheDocument()
  })

  it("renders empty state when no orders", async () => {
    vi.mocked(api.getOrders).mockResolvedValue([])

    render(<OrdersPage />)

    await waitFor(() => {
      expect(screen.getByText("No orders found")).toBeInTheDocument()
    })
  })

  it("renders error state when API fails", async () => {
    vi.mocked(api.getOrders).mockRejectedValue(new Error("Failed to fetch orders"))

    render(<OrdersPage />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load orders/i)).toBeInTheDocument()
    })
  })
})
