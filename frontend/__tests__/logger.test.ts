import { describe, it, expect, vi, beforeEach } from "vitest"
import { createLogger, logApiCall, logUserAction, logError } from "@/lib/logger"
import logger from "@/lib/logger"

describe("Logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("exports a default logger instance", () => {
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe("function")
    expect(typeof logger.error).toBe("function")
  })

  it("createLogger returns a child logger", () => {
    const child = createLogger({ module: "test" })
    expect(child).toBeDefined()
    expect(typeof child.info).toBe("function")
  })

  it("logApiCall logs with correct structure", () => {
    const spy = vi.spyOn(logger, "info")
    logApiCall("GET", "/api/test", 200, 50)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "api_call",
        method: "GET",
        url: "/api/test",
        status: 200,
        duration_ms: 50,
      }),
      expect.stringContaining("GET /api/test")
    )
  })

  it("logUserAction logs with action and details", () => {
    const spy = vi.spyOn(logger, "info")
    logUserAction("click_button", { page: "dashboard" })
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "user_action",
        action: "click_button",
        page: "dashboard",
      }),
      expect.stringContaining("click_button")
    )
  })

  it("logUserAction logs without details", () => {
    const spy = vi.spyOn(logger, "info")
    logUserAction("navigate")
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "user_action", action: "navigate" }),
      expect.any(String)
    )
  })

  it("logError logs error with context", () => {
    const spy = vi.spyOn(logger, "error")
    const error = new Error("Test error")
    logError(error, { endpoint: "/api/fail" })
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "error",
        error_name: "Error",
        error_message: "Test error",
        endpoint: "/api/fail",
      }),
      "Test error"
    )
  })

  it("logError logs error without context", () => {
    const spy = vi.spyOn(logger, "error")
    logError(new Error("Simple error"))
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ event: "error", error_message: "Simple error" }),
      "Simple error"
    )
  })
})
