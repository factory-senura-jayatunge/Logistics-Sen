import { logApiCall, logError } from "./logger"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const method = options?.method || "GET"
  const start = Date.now()

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      endpoint,
      method,
    })
    throw error
  }

  const durationMs = Date.now() - start
  logApiCall(method, endpoint, response.status, durationMs)

  if (!response.ok) {
    const apiError = new Error(`API error: ${response.status} ${response.statusText}`)
    logError(apiError, { endpoint, method, status: response.status })
    throw apiError
  }

  return response.json()
}

// Dashboard
export async function getDashboardStats() {
  return fetchApi<DashboardStats>("/api/v1/dashboard/stats")
}

export async function getRecentShipments(limit = 5) {
  return fetchApi<Shipment[]>(`/api/v1/dashboard/recent-shipments?limit=${limit}`)
}

export async function getShipmentStatusBreakdown() {
  return fetchApi<ShipmentStatusBreakdown[]>("/api/v1/dashboard/shipment-status-breakdown")
}

export async function getShipmentVolume(days = 30) {
  return fetchApi<ShipmentVolumeData[]>(`/api/v1/dashboard/shipment-volume?days=${days}`)
}

// Shipments
export async function getShipments(params?: { status?: string; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set("status", params.status)
  if (params?.limit) searchParams.set("limit", params.limit.toString())
  const query = searchParams.toString()
  return fetchApi<Shipment[]>(`/api/v1/shipments${query ? `?${query}` : ""}`)
}

export async function getShipment(id: number) {
  return fetchApi<ShipmentDetail>(`/api/v1/shipments/${id}`)
}

export async function createShipment(data: CreateShipmentData) {
  return fetchApi<Shipment>("/api/v1/shipments", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Customers
export async function getCustomers() {
  return fetchApi<Customer[]>("/api/v1/customers")
}

export async function getCustomer(id: number) {
  return fetchApi<CustomerDetail>(`/api/v1/customers/${id}`)
}

export async function getCustomerOrders(customerId: number, excludeOrderId?: number, limit = 5) {
  const searchParams = new URLSearchParams()
  if (excludeOrderId) searchParams.set("exclude_order_id", excludeOrderId.toString())
  if (limit) searchParams.set("limit", limit.toString())
  const query = searchParams.toString()
  return fetchApi<OrderBasic[]>(`/api/v1/customers/${customerId}/orders${query ? `?${query}` : ""}`)
}

// Orders
export async function getOrders(params?: { status?: string; priority?: string; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set("status", params.status)
  if (params?.priority) searchParams.set("priority", params.priority)
  if (params?.limit) searchParams.set("limit", params.limit.toString())
  const query = searchParams.toString()
  return fetchApi<Order[]>(`/api/v1/orders${query ? `?${query}` : ""}`)
}

export async function getOrder(id: number) {
  return fetchApi<OrderDetail>(`/api/v1/orders/${id}`)
}

export async function createOrder(data: CreateOrderData) {
  return fetchApi<Order>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Inventory
export async function getInventoryItems(params?: { facility_id?: number; status?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.facility_id) searchParams.set("facility_id", params.facility_id.toString())
  if (params?.status) searchParams.set("status", params.status)
  const query = searchParams.toString()
  return fetchApi<InventoryItem[]>(`/api/v1/inventory${query ? `?${query}` : ""}`)
}

export async function getInventoryItem(id: number) {
  return fetchApi<InventoryItem>(`/api/v1/inventory/${id}`)
}

export async function getLowStockItems() {
  return fetchApi<InventoryItem[]>("/api/v1/inventory/low-stock")
}

export async function updateInventoryItem(id: number, data: UpdateInventoryItemData) {
  return fetchApi<InventoryItem>(`/api/v1/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// Facilities
export async function getFacilities() {
  return fetchApi<Facility[]>("/api/v1/facilities")
}

export async function getFacility(id: number) {
  return fetchApi<FacilityDetail>(`/api/v1/facilities/${id}`)
}

// Vehicles
export async function getVehicles(params?: { type?: string; status?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.type) searchParams.set("type", params.type)
  if (params?.status) searchParams.set("status", params.status)
  const query = searchParams.toString()
  return fetchApi<Vehicle[]>(`/api/v1/vehicles${query ? `?${query}` : ""}`)
}

export async function getVehicle(id: number) {
  return fetchApi<VehicleDetail>(`/api/v1/vehicles/${id}`)
}

export async function createVehicle(data: CreateVehicleData) {
  return fetchApi<Vehicle>("/api/v1/vehicles", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateVehicle(id: number, data: CreateVehicleData) {
  return fetchApi<Vehicle>(`/api/v1/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// Users
export async function getUsers() {
  return fetchApi<User[]>("/api/v1/users")
}

// Notifications
export async function getNotifications(params?: { unread_only?: boolean; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.unread_only) searchParams.set("unread_only", "true")
  if (params?.limit) searchParams.set("limit", params.limit.toString())
  const query = searchParams.toString()
  return fetchApi<Notification[]>(`/api/v1/notifications${query ? `?${query}` : ""}`)
}

export async function getUnreadCount() {
  return fetchApi<{ count: number }>("/api/v1/notifications/unread-count")
}

export async function markNotificationAsRead(id: number) {
  return fetchApi<{ message: string }>(`/api/v1/notifications/${id}/read`, {
    method: "PATCH",
  })
}

export async function markAllNotificationsAsRead() {
  return fetchApi<{ message: string }>("/api/v1/notifications/read-all", {
    method: "PATCH",
  })
}

// Search
export async function search(query: string, limit = 10) {
  return fetchApi<SearchResult[]>(`/api/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`)
}

// Bulk Operations
export interface BulkOperationResult {
  success_count: number
  failed_count: number
  errors: Array<{ id?: number; row?: number; error: string }>
}

export interface CSVImportResult {
  imported: number
  skipped: number
  errors: Array<{ row: number; error: string }>
}

// Orders bulk operations
export async function bulkDeleteOrders(ids: number[]) {
  return fetchApi<BulkOperationResult>("/api/v1/bulk/orders/delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  })
}

export async function bulkUpdateOrderStatus(ids: number[], status: string) {
  return fetchApi<BulkOperationResult>("/api/v1/bulk/orders/status", {
    method: "PATCH",
    body: JSON.stringify({ ids, status }),
  })
}

export async function exportOrdersCSV(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/v1/bulk/orders/export`)
  if (!response.ok) throw new Error("Failed to export orders")
  return response.blob()
}

export async function importOrdersCSV(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const response = await fetch(`${API_BASE_URL}/api/v1/bulk/orders/import`, {
    method: "POST",
    body: formData,
  })
  if (!response.ok) throw new Error("Failed to import orders")
  return response.json() as Promise<CSVImportResult>
}

// Shipments bulk operations
export async function bulkDeleteShipments(ids: number[]) {
  return fetchApi<BulkOperationResult>("/api/v1/bulk/shipments/delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  })
}

export async function bulkUpdateShipmentStatus(ids: number[], status: string) {
  return fetchApi<BulkOperationResult>("/api/v1/bulk/shipments/status", {
    method: "PATCH",
    body: JSON.stringify({ ids, status }),
  })
}

export async function exportShipmentsCSV(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/v1/bulk/shipments/export`)
  if (!response.ok) throw new Error("Failed to export shipments")
  return response.blob()
}

export async function importShipmentsCSV(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const response = await fetch(`${API_BASE_URL}/api/v1/bulk/shipments/import`, {
    method: "POST",
    body: formData,
  })
  if (!response.ok) throw new Error("Failed to import shipments")
  return response.json() as Promise<CSVImportResult>
}

// Inventory bulk operations
export async function bulkDeleteInventory(ids: number[]) {
  return fetchApi<BulkOperationResult>("/api/v1/bulk/inventory/delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  })
}

export async function exportInventoryCSV(): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/v1/bulk/inventory/export`)
  if (!response.ok) throw new Error("Failed to export inventory")
  return response.blob()
}

export async function importInventoryCSV(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const response = await fetch(`${API_BASE_URL}/api/v1/bulk/inventory/import`, {
    method: "POST",
    body: formData,
  })
  if (!response.ok) throw new Error("Failed to import inventory")
  return response.json() as Promise<CSVImportResult>
}

// Types
export interface DashboardStats {
  total_shipments: number
  shipments_in_transit: number
  shipments_delivered: number
  shipments_delayed: number
  total_orders: number
  orders_pending: number
  total_inventory_items: number
  low_stock_items: number
  total_vehicles: number
  vehicles_en_route: number
  total_facilities: number
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  address: string | null
  created_at: string
}

export interface ShipmentSummary {
  id: number
  tracking_number: string
  origin: string
  destination: string
  carrier: string
  status: string
  eta: string | null
  created_at: string
}

export interface CustomerDetail extends Customer {
  orders: OrderBasic[]
  shipments: ShipmentSummary[]
  total_orders: number
  total_spent: number
  total_shipments: number
}

export interface Shipment {
  id: number
  tracking_number: string
  order_id: number | null
  customer_id: number
  origin: string
  destination: string
  carrier: string
  weight_kg: number
  status: string
  eta: string | null
  created_at: string
  updated_at: string
  customer: Customer
}

export interface ShipmentDetail extends Shipment {
  order: Order | null
}

export interface Order {
  id: number
  order_number: string
  customer_id: number
  items_count: number
  total_value: number
  priority: string
  status: string
  created_at: string
  updated_at: string
  customer: Customer
}

export interface ShipmentBasic {
  id: number
  tracking_number: string
  origin: string
  destination: string
  carrier: string
  weight_kg: number
  status: string
  eta: string | null
  created_at: string
}

export interface OrderBasic {
  id: number
  order_number: string
  items_count: number
  total_value: number
  priority: string
  status: string
  created_at: string
}

export interface OrderDetail extends Order {
  shipments: ShipmentBasic[]
}

export interface CreateOrderData {
  customer_id: number
  items_count: number
  total_value: number
  priority?: string
  status?: string
}

export interface Facility {
  id: number
  code: string
  name: string
  type: string
  address: string
  city: string
  state: string
  country: string
  latitude: number | null
  longitude: number | null
  capacity_percentage: number
  staff_count: number
  status: string
  created_at: string
}

export interface InventoryItem {
  id: number
  sku: string
  name: string
  category: string
  facility_id: number
  quantity: number
  reorder_point: number
  unit_price: number
  status: string
  created_at: string
  updated_at: string
  facility: Facility
}

export interface Vehicle {
  id: number
  vehicle_id: string
  name: string
  type: string
  driver: string
  facility_id: number | null
  current_location: string
  destination: string | null
  status: string
  fuel_level: number
  eta: string | null
  created_at: string
}

export interface VehicleDetail extends Vehicle {
  facility: Facility | null
}

export interface InventoryItemBasic {
  id: number
  sku: string
  name: string
  category: string
  quantity: number
  reorder_point: number
  unit_price: number
  status: string
}

export interface VehicleBasic {
  id: number
  vehicle_id: string
  name: string
  type: string
  driver: string
  status: string
  fuel_level: number
  current_location: string
}

export interface FacilityDetail extends Facility {
  inventory_items: InventoryItemBasic[]
  vehicles: VehicleBasic[]
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  status: string
  created_at: string
}

export interface CreateShipmentData {
  customer_id: number
  origin: string
  destination: string
  carrier: string
  weight_kg: number
  status?: string
  eta?: string
}

export interface Notification {
  id: number
  user_id: number | null
  title: string
  message: string | null
  type: string
  category: string
  reference_id: number | null
  reference_type: string | null
  read: boolean
  created_at: string
}

export interface SearchResult {
  id: number
  type: string
  title: string
  subtitle: string
  url: string
}

export interface ShipmentStatusBreakdown {
  status: string
  count: number
}

export interface ShipmentVolumeData {
  date: string
  count: number
}

export interface UpdateInventoryItemData {
  sku: string
  name: string
  category: string
  facility_id: number
  quantity: number
  reorder_point: number
  unit_price: number
  status: string
}

export interface CreateVehicleData {
  vehicle_id: string
  name: string
  type: string
  driver: string
  facility_id?: number
  current_location: string
  destination?: string
  status: string
  fuel_level: number
}
