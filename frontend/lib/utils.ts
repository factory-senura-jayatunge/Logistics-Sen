import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Status color maps
export const shipmentStatusColors: Record<string, string> = {
  delivered: "bg-green-500/10 text-green-600 border-green-200",
  in_transit: "bg-blue-500/10 text-blue-600 border-blue-200",
  delayed: "bg-red-500/10 text-red-600 border-red-200",
  processing: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  pending: "bg-gray-500/10 text-gray-600 border-gray-200",
}

export const orderStatusColors: Record<string, string> = {
  pending: "bg-gray-500/10 text-gray-600 border-gray-200",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-200",
  processing: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  shipped: "bg-purple-500/10 text-purple-600 border-purple-200",
  delivered: "bg-green-500/10 text-green-600 border-green-200",
}

export const priorityColors: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-600 border-slate-200",
  medium: "bg-blue-500/10 text-blue-600 border-blue-200",
  high: "bg-orange-500/10 text-orange-600 border-orange-200",
  critical: "bg-red-500/10 text-red-600 border-red-200",
}

export const inventoryStatusColors: Record<string, string> = {
  in_stock: "bg-green-500/10 text-green-600 border-green-200",
  low_stock: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  out_of_stock: "bg-red-500/10 text-red-600 border-red-200",
}

export const facilityTypeColors: Record<string, string> = {
  distribution: "bg-blue-500/10 text-blue-600 border-blue-200",
  hub: "bg-purple-500/10 text-purple-600 border-purple-200",
  fulfillment: "bg-green-500/10 text-green-600 border-green-200",
  warehouse: "bg-orange-500/10 text-orange-600 border-orange-200",
  port: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
}

export const facilityStatusColors: Record<string, string> = {
  operational: "bg-green-500/10 text-green-600 border-green-200",
  maintenance: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  offline: "bg-red-500/10 text-red-600 border-red-200",
}

export const vehicleStatusColors: Record<string, string> = {
  en_route: "bg-blue-500/10 text-blue-600 border-blue-200",
  loading: "bg-purple-500/10 text-purple-600 border-purple-200",
  idle: "bg-gray-500/10 text-gray-600 border-gray-200",
  maintenance: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  offline: "bg-red-500/10 text-red-600 border-red-200",
}

// Formatters
export function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateLong(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatCurrency(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatWeight(kg: number): string {
  return `${kg.toLocaleString()} kg`
}

export function formatTimeAgo(dateString: string): string {
  // Append Z if no timezone indicator to treat as UTC
  const normalized = dateString.endsWith("Z") || dateString.includes("+") ? dateString : dateString + "Z"
  const date = new Date(normalized)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}
