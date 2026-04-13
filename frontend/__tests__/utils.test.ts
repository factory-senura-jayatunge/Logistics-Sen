import { describe, it, expect } from "vitest"
import {
  cn,
  formatDate,
  formatDateLong,
  formatDateTime,
  formatCurrency,
  formatWeight,
  formatTimeAgo,
  shipmentStatusColors,
  orderStatusColors,
  priorityColors,
} from "@/lib/utils"

describe("cn utility", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1")
  })

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible")
  })

  it("merges tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })
})

describe("formatDate", () => {
  it("formats date string correctly", () => {
    const result = formatDate("2024-03-15T10:30:00Z")
    expect(result).toContain("Mar")
    expect(result).toContain("15")
    expect(result).toContain("2024")
  })

  it("returns dash for null input", () => {
    expect(formatDate(null)).toBe("-")
  })
})

describe("formatDateLong", () => {
  it("formats date with weekday", () => {
    const result = formatDateLong("2024-03-15T10:30:00Z")
    expect(result).toContain("March")
    expect(result).toContain("15")
    expect(result).toContain("2024")
  })
})

describe("formatDateTime", () => {
  it("formats date and time", () => {
    const result = formatDateTime("2024-03-15T10:30:00Z")
    expect(result).toContain("Mar")
    expect(result).toContain("15")
    expect(result).toContain("2024")
  })
})

describe("formatCurrency", () => {
  it("formats currency with no decimals by default", () => {
    expect(formatCurrency(1234)).toBe("$1,234")
  })

  it("formats currency with specified decimals", () => {
    expect(formatCurrency(1234.56, 2)).toBe("$1,234.56")
  })

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0")
  })

  it("handles large numbers", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000")
  })
})

describe("formatWeight", () => {
  it("formats weight with kg unit", () => {
    expect(formatWeight(100)).toBe("100 kg")
  })

  it("formats large weights with commas", () => {
    expect(formatWeight(1500)).toBe("1,500 kg")
  })
})

describe("formatTimeAgo", () => {
  it('returns "Just now" for recent timestamps', () => {
    const now = new Date().toISOString()
    expect(formatTimeAgo(now)).toBe("Just now")
  })

  it("returns minutes ago for recent timestamps", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(formatTimeAgo(fiveMinutesAgo)).toBe("5 min ago")
  })

  it("returns hours ago for older timestamps", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(threeHoursAgo)).toBe("3 hours ago")
  })

  it("returns days ago for much older timestamps", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(twoDaysAgo)).toBe("2 days ago")
  })

  it("returns singular hour for 1 hour ago", () => {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(oneHourAgo)).toBe("1 hour ago")
  })

  it("returns singular day for 1 day ago", () => {
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(oneDayAgo)).toBe("1 day ago")
  })

  it("handles timestamps without Z suffix", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const noZ = fiveMinutesAgo.toISOString().replace("Z", "")
    expect(formatTimeAgo(noZ)).toBe("5 min ago")
  })

  it("handles timestamps with + timezone offset", () => {
    const recent = new Date(Date.now() - 30 * 1000).toISOString().replace("Z", "+00:00")
    expect(formatTimeAgo(recent)).toBe("Just now")
  })
})

describe("status color maps", () => {
  it("has all shipment status colors", () => {
    expect(shipmentStatusColors).toHaveProperty("delivered")
    expect(shipmentStatusColors).toHaveProperty("in_transit")
    expect(shipmentStatusColors).toHaveProperty("delayed")
    expect(shipmentStatusColors).toHaveProperty("processing")
    expect(shipmentStatusColors).toHaveProperty("pending")
  })

  it("has all order status colors", () => {
    expect(orderStatusColors).toHaveProperty("pending")
    expect(orderStatusColors).toHaveProperty("confirmed")
    expect(orderStatusColors).toHaveProperty("processing")
    expect(orderStatusColors).toHaveProperty("shipped")
    expect(orderStatusColors).toHaveProperty("delivered")
  })

  it("has all priority colors", () => {
    expect(priorityColors).toHaveProperty("low")
    expect(priorityColors).toHaveProperty("medium")
    expect(priorityColors).toHaveProperty("high")
    expect(priorityColors).toHaveProperty("critical")
  })
})
