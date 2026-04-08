import { test, expect } from "@playwright/test";

test.describe("Application Navigation", () => {
  test("homepage redirects to dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("dashboard loads with stats cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Total Shipments")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator("text=Pending Orders")).toBeVisible();
    await expect(page.locator("text=Active Alerts")).toBeVisible();
  });

  test("sidebar navigation links work", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Dashboard")).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("link", { name: "Shipments" }).click();
    await expect(page).toHaveURL(/\/shipments/);
    await expect(
      page.locator("h1, h2").filter({ hasText: /shipment/i }),
    ).toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page).toHaveURL(/\/orders/);

    await page.getByRole("link", { name: "Customers" }).click();
    await expect(page).toHaveURL(/\/customers/);

    await page.getByRole("link", { name: "Inventory" }).click();
    await expect(page).toHaveURL(/\/inventory/);

    await page.getByRole("link", { name: "Facilities" }).click();
    await expect(page).toHaveURL(/\/facilities/);

    await page.getByRole("link", { name: "Fleet" }).click();
    await expect(page).toHaveURL(/\/fleet/);
  });
});
