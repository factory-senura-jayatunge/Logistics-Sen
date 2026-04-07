import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useIsMobile } from "@/hooks/use-mobile"

describe("useIsMobile", () => {
  let listeners: Map<string, () => void>

  beforeEach(() => {
    listeners = new Map()
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn((event: string, handler: () => void) => {
          listeners.set(event, handler)
        }),
        removeEventListener: vi.fn((event: string) => {
          listeners.delete(event)
        }),
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    listeners.clear()
  })

  it("returns false when window width is above breakpoint", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true, configurable: true })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it("returns true when window width is below breakpoint", () => {
    Object.defineProperty(window, "innerWidth", { value: 500, writable: true, configurable: true })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it("registers event listener on mount", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true, configurable: true })
    renderHook(() => useIsMobile())
    expect(listeners.has("change")).toBe(true)
  })

  it("updates when change event fires", () => {
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true, configurable: true })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      Object.defineProperty(window, "innerWidth", { value: 500, writable: true, configurable: true })
      const handler = listeners.get("change")
      if (handler) handler()
    })
    expect(result.current).toBe(true)
  })
})
