import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Total Shipments")).toBeVisible({
      timeout: 15000,
    });
  });

  test("displays key metric cards", async ({ page }) => {
    const cards = page.locator('[class*="card"]');
    await expect(cards.first()).toBeVisible();

    await expect(page.locator("text=Total Shipments")).toBeVisible();
    await expect(page.locator("text=Pending Orders")).toBeVisible();
    await expect(page.locator("text=Active Alerts")).toBeVisible();
    await expect(page.locator("text=Active Vehicles")).toBeVisible();
  });

  test("displays recent shipments table", async ({ page }) => {
    await expect(page.locator("text=Recent Shipments")).toBeVisible({
      timeout: 10000,
    });
    const trackingIds = page.locator("text=/SHP-\\d{4}-\\d{4}/");
    await expect(trackingIds.first()).toBeVisible({ timeout: 10000 });
  });

  test("displays shipment status breakdown chart", async ({ page }) => {
    await expect(page.locator("text=Shipment Status")).toBeVisible({
      timeout: 10000,
    });
  });

  test("metric cards show numeric values", async ({ page }) => {
    const metricValues = page.locator(
      '[class*="card"] [class*="text-2xl"], [class*="card"] [class*="text-3xl"]',
    );
    const count = await metricValues.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
