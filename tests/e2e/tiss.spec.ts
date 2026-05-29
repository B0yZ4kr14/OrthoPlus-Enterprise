import { test, expect } from "./fixtures";

test.describe("TISS — Insurance Billing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./faturamento-tiss");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display TISS page with all tabs", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "TISS", exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText(/troca de informações em saúde suplementar/i),
    ).toBeVisible();

    // Check all main tabs
    await expect(page.getByRole("tab", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /guias/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /lotes/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /glosas/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /convênios/i })).toBeVisible();

    await expect(
      page.getByRole("button", { name: /nova guia/i }),
    ).toBeVisible();
  });

  test("should navigate to TISS and verify URL", async ({ page }) => {
    await page.goto("./faturamento-tiss");
    await page.waitForLoadState("domcontentloaded");

    await expect(page).toHaveURL(/.*\/faturamento-tiss/);

    await expect(
      page.getByRole("heading", { name: "TISS", exact: true }),
    ).toBeVisible();
  });

  test("should display dashboard KPIs", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /dashboard/i })).toBeVisible();

    // Check for KPI cards - use card titles to avoid ambiguity with tab names
    await expect(
      page.locator(".text-sm.font-medium", { hasText: /guias pendentes/i }),
    ).toBeVisible();
    await expect(
      page.locator(".text-sm.font-medium", { hasText: /enviadas/i }),
    ).toBeVisible();
    await expect(
      page.locator(".text-sm.font-medium", { hasText: /taxa de aprovação/i }),
    ).toBeVisible();
    await expect(
      page.locator(".text-sm.font-medium", { hasText: /glosas/i }).first(),
    ).toBeVisible();
  });

  test("should display glosas tab", async ({ page }) => {
    await page.getByRole("tab", { name: /glosas/i }).click();

    await expect(
      page.getByRole("heading", { name: /gestão de glosas/i }),
    ).toBeVisible();
  });

  test("should display convenios tab", async ({ page }) => {
    await page.getByRole("tab", { name: /convênios/i }).click();

    await expect(
      page.getByRole("heading", { name: /convênios/i }),
    ).toBeVisible();
  });
});
