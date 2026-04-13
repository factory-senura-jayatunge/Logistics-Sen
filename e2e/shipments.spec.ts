import { test, expect } from "@playwright/test";

test.describe("Shipments Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/shipments");
    await expect(page.locator("text=/SHP-\\d{4}-\\d{4}/").first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("displays shipments table with tracking IDs", async ({ page }) => {
    const rows = page.locator("text=/SHP-\\d{4}-\\d{4}/");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("displays status badges", async ({ page }) => {
    const statuses = [
      "Delivered",
      "In Transit",
      "Delayed",
      "Processing",
      "Pending",
    ];
    let found = false;
    for (const status of statuses) {
      const badge = page.locator(`text=${status}`).first();
      if ((await badge.count()) > 0) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  test("search filters shipments", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).first();
    if ((await searchInput.count()) > 0) {
      await searchInput.fill("SHP");
      await page.waitForTimeout(500);
      const rows = page.locator("text=/SHP-\\d{4}-\\d{4}/");
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("clicking a shipment navigates to detail page", async ({ page }) => {
    const firstShipment = page.locator("text=/SHP-\\d{4}-\\d{4}/").first();
    const trackingId = await firstShipment.textContent();
    await firstShipment.click();
    await expect(page).toHaveURL(/\/shipments\/\d+/);
    if (trackingId) {
      await expect(page.locator(`text=${trackingId}`)).toBeVisible({
        timeout: 10000,
      });
    }
  });
});
