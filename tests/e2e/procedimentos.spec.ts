import { test, expect } from "./fixtures";

test.describe("Procedure Management", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("./procedimentos");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display procedures page", async ({ page }) => {
    // Check that the page title is visible
    await expect(
      page.getByRole("heading", { name: "Procedimentos", exact: true }),
    ).toBeVisible();

    // Check page description
    await expect(
      page.getByText(/gerencie o catálogo de procedimentos/i),
    ).toBeVisible();

    // Check that the list or add button is present
    await expect(
      page.getByRole("button", { name: /novo procedimento/i }).first(),
    ).toBeVisible();
  });

  test("should navigate to procedures", async ({ page }) => {
    // Navigate directly to the route
    await page.goto("./procedimentos");
    await page.waitForLoadState("domcontentloaded");

    // Check URL
    await expect(page).toHaveURL(/.*\/procedimentos/);

    // Check that main content loaded
    await expect(
      page.getByRole("heading", { name: "Procedimentos", exact: true }),
    ).toBeVisible();
  });
});
