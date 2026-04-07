import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getDashboardStats,
  getRecentShipments,
  getShipmentStatusBreakdown,
  getShipmentVolume,
  getShipments,
  getShipment,
  createShipment,
  getCustomers,
  getCustomer,
  getCustomerOrders,
  getOrders,
  getOrder,
  createOrder,
  getInventoryItems,
  getInventoryItem,
  getLowStockItems,
  updateInventoryItem,
  getFacilities,
  getFacility,
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  getUsers,
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  search,
  bulkDeleteOrders,
  bulkUpdateOrderStatus,
  exportOrdersCSV,
  importOrdersCSV,
  bulkDeleteShipments,
  bulkUpdateShipmentStatus,
  exportShipmentsCSV,
  importShipmentsCSV,
  bulkDeleteInventory,
  exportInventoryCSV,
  importInventoryCSV,
  type CreateShipmentData,
  type CreateOrderData,
  type UpdateInventoryItemData,
  type CreateVehicleData,
} from "@/lib/api"

vi.mock("@/lib/logger", () => ({
  logApiCall: vi.fn(),
  logError: vi.fn(),
  default: { info: vi.fn(), error: vi.fn(), debug: vi.fn(), child: vi.fn() },
}))

const mockJsonResponse = (data: unknown, ok = true, status = 200) => ({
  ok,
  status,
  statusText: ok ? "OK" : "Internal Server Error",
  json: () => Promise.resolve(data),
})

describe("API client", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("Dashboard endpoints", () => {
    it("getDashboardStats fetches stats", async () => {
      const mockData = { total_shipments: 10 }
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse(mockData) as Response)
      const result = await getDashboardStats()
      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/dashboard/stats"),
        expect.any(Object)
      )
    })

    it("getRecentShipments fetches with limit", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getRecentShipments(10)
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("limit=10"), expect.any(Object))
    })

    it("getShipmentStatusBreakdown fetches breakdown", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      const result = await getShipmentStatusBreakdown()
      expect(result).toEqual([])
    })

    it("getShipmentVolume fetches with days param", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getShipmentVolume(7)
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("days=7"), expect.any(Object))
    })
  })

  describe("Shipments endpoints", () => {
    it("getShipments without params", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getShipments()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/shipments"),
        expect.any(Object)
      )
    })

    it("getShipments with status filter", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getShipments({ status: "in_transit" })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("status=in_transit"),
        expect.any(Object)
      )
    })

    it("getShipments with limit", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getShipments({ limit: 5 })
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("limit=5"), expect.any(Object))
    })

    it("getShipment fetches by id", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ id: 1 }) as Response)
      const result = await getShipment(1)
      expect(result).toEqual({ id: 1 })
    })

    it("createShipment posts data", async () => {
      const shipmentData: CreateShipmentData = {
        customer_id: 1,
        origin: "NY",
        destination: "LA",
        carrier: "FedEx",
        weight_kg: 10,
      }
      vi.spyOn(global, "fetch").mockResolvedValue(
        mockJsonResponse({ id: 1, ...shipmentData }) as Response
      )
      await createShipment(shipmentData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/shipments"),
        expect.objectContaining({ method: "POST" })
      )
    })
  })

  describe("Customers endpoints", () => {
    it("getCustomers fetches list", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getCustomers()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/customers"),
        expect.any(Object)
      )
    })

    it("getCustomer fetches by id", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ id: 5 }) as Response)
      await getCustomer(5)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/customers/5"),
        expect.any(Object)
      )
    })

    it("getCustomerOrders with params", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getCustomerOrders(1, 10, 3)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("exclude_order_id=10"),
        expect.any(Object)
      )
    })

    it("getCustomerOrders without exclude", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getCustomerOrders(1)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/customers/1/orders"),
        expect.any(Object)
      )
    })
  })

  describe("Orders endpoints", () => {
    it("getOrders without params", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getOrders()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/orders"),
        expect.any(Object)
      )
    })

    it("getOrders with status and priority", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getOrders({ status: "pending", priority: "high" })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("status=pending"),
        expect.any(Object)
      )
    })

    it("getOrder fetches by id", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ id: 3 }) as Response)
      await getOrder(3)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/orders/3"),
        expect.any(Object)
      )
    })

    it("createOrder posts data", async () => {
      const orderData: CreateOrderData = {
        customer_id: 1,
        items_count: 3,
        total_value: 100,
        priority: "medium",
      }
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ id: 1 }) as Response)
      await createOrder(orderData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/orders"),
        expect.objectContaining({ method: "POST" })
      )
    })
  })

  describe("Inventory endpoints", () => {
    it("getInventoryItems without params", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getInventoryItems()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/inventory"),
        expect.any(Object)
      )
    })

    it("getInventoryItems with facility and status filter", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getInventoryItems({ facility_id: 1, status: "low_stock" })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("facility_id=1"),
        expect.any(Object)
      )
    })

    it("getInventoryItem fetches by id", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ id: 1 }) as Response)
      await getInventoryItem(1)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/inventory/1"),
        expect.any(Object)
      )
    })

    it("getLowStockItems fetches low stock", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getLowStockItems()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/inventory/low-stock"),
        expect.any(Object)
      )
    })

    it("updateInventoryItem sends PUT", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ id: 1 }) as Response)
      const updateData: UpdateInventoryItemData = {
        sku: "SKU-001",
        name: "Test",
        category: "Test",
        facility_id: 1,
        quantity: 50,
        reorder_point: 10,
        unit_price: 9.99,
        status: "in_stock",
      }
      await updateInventoryItem(1, updateData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/inventory/1"),
        expect.objectContaining({ method: "PUT" })
      )
    })
  })

  describe("Facilities endpoints", () => {
    it("getFacilities fetches list", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getFacilities()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/facilities"),
        expect.any(Object)
      )
    })

    it("getFacility fetches by id", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ id: 1 }) as Response)
      await getFacility(1)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/facilities/1"),
        expect.any(Object)
      )
    })
  })

  describe("Vehicles endpoints", () => {
    it("getVehicles without params", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getVehicles()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/vehicles"),
        expect.any(Object)
      )
    })

    it("getVehicles with type and status", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getVehicles({ type: "truck", status: "idle" })
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("type=truck"), expect.any(Object))
    })

    it("getVehicle fetches by id", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ id: 1 }) as Response)
      await getVehicle(1)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/vehicles/1"),
        expect.any(Object)
      )
    })

    it("createVehicle posts data", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ id: 1 }) as Response)
      const vehicleData: CreateVehicleData = {
        vehicle_id: "VH-001",
        name: "Truck 1",
        type: "truck",
        driver: "John",
        current_location: "NY",
        status: "idle",
        fuel_level: 80,
      }
      await createVehicle(vehicleData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/vehicles"),
        expect.objectContaining({ method: "POST" })
      )
    })

    it("updateVehicle sends PUT", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ id: 1 }) as Response)
      const vehicleData: CreateVehicleData = {
        vehicle_id: "VH-001",
        name: "Truck Updated",
        type: "truck",
        driver: "John",
        current_location: "NY",
        status: "idle",
        fuel_level: 80,
      }
      await updateVehicle(1, vehicleData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/vehicles/1"),
        expect.objectContaining({ method: "PUT" })
      )
    })
  })

  describe("Users endpoint", () => {
    it("getUsers fetches list", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getUsers()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/users"),
        expect.any(Object)
      )
    })
  })

  describe("Notifications endpoints", () => {
    it("getNotifications without params", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getNotifications()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/notifications"),
        expect.any(Object)
      )
    })

    it("getNotifications with unread_only", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getNotifications({ unread_only: true })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("unread_only=true"),
        expect.any(Object)
      )
    })

    it("getNotifications with limit", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await getNotifications({ limit: 5 })
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("limit=5"), expect.any(Object))
    })

    it("getUnreadCount fetches count", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ count: 3 }) as Response)
      const result = await getUnreadCount()
      expect(result).toEqual({ count: 3 })
    })

    it("markNotificationAsRead sends PATCH", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ message: "ok" }) as Response)
      await markNotificationAsRead(1)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/notifications/1/read"),
        expect.objectContaining({ method: "PATCH" })
      )
    })

    it("markAllNotificationsAsRead sends PATCH", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse({ message: "ok" }) as Response)
      await markAllNotificationsAsRead()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/notifications/read-all"),
        expect.objectContaining({ method: "PATCH" })
      )
    })
  })

  describe("Search endpoint", () => {
    it("search sends query", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await search("test query")
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("q=test%20query"),
        expect.any(Object)
      )
    })

    it("search with custom limit", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse([]) as Response)
      await search("test", 20)
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("limit=20"), expect.any(Object))
    })
  })

  describe("Bulk operations - Orders", () => {
    it("bulkDeleteOrders posts ids", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        mockJsonResponse({ success_count: 2, failed_count: 0, errors: [] }) as Response
      )
      await bulkDeleteOrders([1, 2])
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/bulk/orders/delete"),
        expect.objectContaining({ method: "POST" })
      )
    })

    it("bulkUpdateOrderStatus patches ids and status", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        mockJsonResponse({ success_count: 1, failed_count: 0, errors: [] }) as Response
      )
      await bulkUpdateOrderStatus([1], "shipped")
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/bulk/orders/status"),
        expect.objectContaining({ method: "PATCH" })
      )
    })

    it("exportOrdersCSV returns blob", async () => {
      const mockBlob = new Blob(["csv"])
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response)
      const result = await exportOrdersCSV()
      expect(result).toBe(mockBlob)
    })

    it("exportOrdersCSV throws on failure", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response)
      await expect(exportOrdersCSV()).rejects.toThrow("Failed to export orders")
    })

    it("importOrdersCSV uploads file", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ imported: 5, skipped: 0, errors: [] }),
      } as Response)
      const file = new File(["data"], "test.csv", { type: "text/csv" })
      const result = await importOrdersCSV(file)
      expect(result.imported).toBe(5)
    })

    it("importOrdersCSV throws on failure", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response)
      const file = new File(["data"], "test.csv", { type: "text/csv" })
      await expect(importOrdersCSV(file)).rejects.toThrow("Failed to import orders")
    })
  })

  describe("Bulk operations - Shipments", () => {
    it("bulkDeleteShipments posts ids", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        mockJsonResponse({ success_count: 1, failed_count: 0, errors: [] }) as Response
      )
      await bulkDeleteShipments([1])
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/bulk/shipments/delete"),
        expect.objectContaining({ method: "POST" })
      )
    })

    it("bulkUpdateShipmentStatus patches", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        mockJsonResponse({ success_count: 1, failed_count: 0, errors: [] }) as Response
      )
      await bulkUpdateShipmentStatus([1], "delivered")
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/bulk/shipments/status"),
        expect.objectContaining({ method: "PATCH" })
      )
    })

    it("exportShipmentsCSV returns blob", async () => {
      const mockBlob = new Blob(["csv"])
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response)
      const result = await exportShipmentsCSV()
      expect(result).toBe(mockBlob)
    })

    it("exportShipmentsCSV throws on failure", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response)
      await expect(exportShipmentsCSV()).rejects.toThrow("Failed to export shipments")
    })

    it("importShipmentsCSV uploads file", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ imported: 3, skipped: 1, errors: [] }),
      } as Response)
      const file = new File(["data"], "test.csv", { type: "text/csv" })
      const result = await importShipmentsCSV(file)
      expect(result.imported).toBe(3)
    })

    it("importShipmentsCSV throws on failure", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response)
      const file = new File(["data"], "test.csv", { type: "text/csv" })
      await expect(importShipmentsCSV(file)).rejects.toThrow("Failed to import shipments")
    })
  })

  describe("Bulk operations - Inventory", () => {
    it("bulkDeleteInventory posts ids", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        mockJsonResponse({ success_count: 2, failed_count: 0, errors: [] }) as Response
      )
      await bulkDeleteInventory([1, 2])
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/bulk/inventory/delete"),
        expect.objectContaining({ method: "POST" })
      )
    })

    it("exportInventoryCSV returns blob", async () => {
      const mockBlob = new Blob(["csv"])
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response)
      const result = await exportInventoryCSV()
      expect(result).toBe(mockBlob)
    })

    it("exportInventoryCSV throws on failure", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response)
      await expect(exportInventoryCSV()).rejects.toThrow("Failed to export inventory")
    })

    it("importInventoryCSV uploads file", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ imported: 10, skipped: 0, errors: [] }),
      } as Response)
      const file = new File(["data"], "test.csv", { type: "text/csv" })
      const result = await importInventoryCSV(file)
      expect(result.imported).toBe(10)
    })

    it("importInventoryCSV throws on failure", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue({ ok: false } as Response)
      const file = new File(["data"], "test.csv", { type: "text/csv" })
      await expect(importInventoryCSV(file)).rejects.toThrow("Failed to import inventory")
    })
  })

  describe("Error handling", () => {
    it("throws on non-ok response", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(mockJsonResponse(null, false, 500) as Response)
      await expect(getDashboardStats()).rejects.toThrow("API error: 500")
    })

    it("throws on network error", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network failure"))
      await expect(getDashboardStats()).rejects.toThrow("Network failure")
    })

    it("handles non-Error thrown values", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue("string error")
      await expect(getDashboardStats()).rejects.toBe("string error")
    })
  })
})
