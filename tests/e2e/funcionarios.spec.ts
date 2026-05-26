import { test, expect } from "./fixtures";

test.describe("Employee Management", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("./funcionarios");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display employees page", async ({ page }) => {
    // Check that the page title is visible
    await expect(
      page.getByRole("heading", { name: "Funcionários", exact: true }),
    ).toBeVisible();

    // Check page description
    await expect(
      page.getByText(/gestão da equipe e colaboradores/i),
    ).toBeVisible();

    // Check new employee button
    await expect(
      page.getByRole("button", { name: /novo funcionário/i }),
    ).toBeVisible();
  });

  test("should navigate to employees", async ({ page }) => {
    // Navigate directly to the route
    await page.goto("./funcionarios");
    await page.waitForLoadState("domcontentloaded");

    // Check URL
    await expect(page).toHaveURL(/.*\/funcionarios/);

    // Check that the employee list or empty state loaded
    await expect(
      page.getByRole("heading", { name: "Funcionários", exact: true }),
    ).toBeVisible();
  });
});
