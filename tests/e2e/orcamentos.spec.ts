import { test, expect } from "./fixtures";

test.describe("Budget Management", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("./orcamentos");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display budgets page", async ({ page }) => {
    // Check that the page title is visible
    await expect(
      page.getByRole("heading", { name: "Orçamentos", exact: true }),
    ).toBeVisible();

    // Check that filter tabs are present
    await expect(page.getByRole("tab", { name: /todos/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /rascunhos/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /pendentes/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /aprovados/i })).toBeVisible();

    // Check new budget button
    await expect(
      page.getByRole("button", { name: /novo orçamento/i }),
    ).toBeVisible();
  });

  test("should navigate to budgets", async ({ page }) => {
    // Navigate directly to the route
    await page.goto("./orcamentos");
    await page.waitForLoadState("domcontentloaded");

    // Check URL
    await expect(page).toHaveURL(/.*\/orcamentos/);

    // Check that the page loaded with metric cards
    await expect(page.getByText(/total de orçamentos/i)).toBeVisible();
    await expect(page.getByText(/pendentes/i)).toBeVisible();
    await expect(page.getByText(/aprovados/i)).toBeVisible();
  });
});
