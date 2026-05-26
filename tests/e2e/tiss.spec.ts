import { test, expect } from "./fixtures";

test.describe("TISS — Insurance Billing", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("./faturamento-tiss");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display TISS page", async ({ page }) => {
    // Check that the page title is visible
    await expect(
      page.getByRole("heading", { name: "TISS", exact: true }),
    ).toBeVisible();

    // Check description
    await expect(
      page.getByText(/troca de informações em saúde suplementar/i),
    ).toBeVisible();

    // Check main tabs
    await expect(page.getByRole("tab", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /guias/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /lotes/i })).toBeVisible();

    // Check new guide button
    await expect(
      page.getByRole("button", { name: /nova guia/i }),
    ).toBeVisible();
  });

  test("should navigate to TISS", async ({ page }) => {
    // Navigate directly to the route
    await page.goto("./faturamento-tiss");
    await page.waitForLoadState("domcontentloaded");

    // Check URL
    await expect(page).toHaveURL(/.*\/faturamento-tiss/);

    // Check that main content loaded
    await expect(
      page.getByRole("heading", { name: "TISS", exact: true }),
    ).toBeVisible();
  });
});
