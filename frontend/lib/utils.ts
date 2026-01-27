import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Status color maps using theme colors
export const shipmentStatusColors: Record<string, string> = {
  delivered: "bg-success/10 text-success border-success/20",
  in_transit: "bg-info/10 text-info border-info/20",
  delayed: "bg-destructive/10 text-destructive border-destructive/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  pending: "bg-neutral/10 text-neutral border-neutral/20",
}

export const orderStatusColors: Record<string, string> = {
  pending: "bg-neutral/10 text-neutral border-neutral/20",
  confirmed: "bg-info/10 text-info border-info/20",
  processing: "bg-warning/10 text-warning border-warning/20",
  shipped: "bg-secondary/10 text-secondary border-secondary/20",
  delivered: "bg-success/10 text-success border-success/20",
}

export const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-info/10 text-info border-info/20",
  high: "bg-warning/10 text-warning border-warning/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
}

export const inventoryStatusColors: Record<string, string> = {
  in_stock: "bg-success/10 text-success border-success/20",
  low_stock: "bg-warning/10 text-warning border-warning/20",
  out_of_stock: "bg-destructive/10 text-destructive border-destructive/20",
}

export const facilityTypeColors: Record<string, string> = {
  distribution: "bg-info/10 text-info border-info/20",
  hub: "bg-secondary/10 text-secondary border-secondary/20",
  fulfillment: "bg-success/10 text-success border-success/20",
  warehouse: "bg-warning/10 text-warning border-warning/20",
  port: "bg-primary/10 text-primary border-primary/20",
}

export const facilityStatusColors: Record<string, string> = {
  operational: "bg-success/10 text-success border-success/20",
  maintenance: "bg-warning/10 text-warning border-warning/20",
  offline: "bg-destructive/10 text-destructive border-destructive/20",
}

export const vehicleStatusColors: Record<string, string> = {
  en_route: "bg-info/10 text-info border-info/20",
  loading: "bg-secondary/10 text-secondary border-secondary/20",
  idle: "bg-neutral/10 text-neutral border-neutral/20",
  maintenance: "bg-warning/10 text-warning border-warning/20",
  offline: "bg-destructive/10 text-destructive border-destructive/20",
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
  const normalized =
    dateString.endsWith("Z") || dateString.includes("+") ? dateString : dateString + "Z"
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
