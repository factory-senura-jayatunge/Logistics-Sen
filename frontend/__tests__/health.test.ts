import { describe, it, expect } from "vitest"
import { GET } from "@/app/api/health/route"

describe("Health check endpoint", () => {
  it("returns healthy status with service name", async () => {
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("healthy")
    expect(body.service).toBe("frontend")
    expect(body.timestamp).toBeDefined()
  })

  it("returns a valid ISO timestamp", async () => {
    const response = await GET()
    const body = await response.json()
    const parsed = new Date(body.timestamp)

    expect(parsed.toISOString()).toBe(body.timestamp)
  })
})
