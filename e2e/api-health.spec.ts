import { test, expect } from "@playwright/test";

test.describe("Backend API Health", () => {
  test("health endpoint returns healthy", async ({ request }) => {
    const response = await request.get("http://localhost:8000/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("healthy");
  });

  test("API root returns version info", async ({ request }) => {
    const response = await request.get("http://localhost:8000/");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.message).toBe("Acme Logistics API");
    expect(body.version).toBe("1.0.0");
  });

  test("dashboard stats API returns data", async ({ request }) => {
    const response = await request.get(
      "http://localhost:8000/api/v1/dashboard/stats",
    );
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty("total_shipments");
    expect(body).toHaveProperty("pending_orders");
    expect(body).toHaveProperty("active_alerts");
  });

  test("shipments API returns list", async ({ request }) => {
    const response = await request.get(
      "http://localhost:8000/api/v1/shipments/",
    );
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty("tracking_number");
      expect(body[0]).toHaveProperty("status");
    }
  });

  test("customers API returns list", async ({ request }) => {
    const response = await request.get(
      "http://localhost:8000/api/v1/customers/",
    );
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expect(body[0]).toHaveProperty("name");
      expect(body[0]).toHaveProperty("email");
    }
  });

  test("search API works with query", async ({ request }) => {
    const response = await request.get(
      "http://localhost:8000/api/v1/search/?q=test",
    );
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty("results");
  });
});
