import { test, expect } from "./fixtures";

test.describe("Main Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display main KPIs", async ({ page }) => {
    await expect(page.getByText(/receitas|faturamento/i)).toBeVisible();
    await expect(page.getByText(/pacientes/i)).toBeVisible();
    await expect(page.getByText(/consultas/i)).toBeVisible();
  });

  test("should display analysis charts", async ({ page }) => {
    await expect(page.locator('[class*="chart"]').first()).toBeVisible();
  });

  test("should switch between dashboard tabs", async ({ page }) => {
    await page.getByRole("tab", { name: /visão geral/i }).click();
    await expect(page.getByText(/visão geral/i)).toBeVisible();

    await page.getByRole("tab", { name: /financeiro/i }).click();
    await expect(page.getByText(/receitas|despesas/i)).toBeVisible();

    await page.getByRole("tab", { name: /clínica/i }).click();
    await expect(page.getByText(/pacientes|consultas/i)).toBeVisible();
  });

  test("should navigate to modules through sidebar", async ({ page }) => {
    await page.getByRole("link", { name: /pacientes/i }).click();
    await expect(page).toHaveURL(/\/pacientes/);

    await page.getByRole("link", { name: /agenda/i }).click();
    await expect(page).toHaveURL(/\/agenda/);

    await page.getByRole("link", { name: /financeiro/i }).click();
    await expect(page).toHaveURL(/\/financeiro/);
  });

  test("should load data in reasonable time", async ({ page }) => {
    const startTime = Date.now();
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000); // Less than 5 seconds
  });
});
