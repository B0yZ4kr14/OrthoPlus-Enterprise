import { test, expect } from "./fixtures";

test.describe("Point of Sale (PDV)", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("./pdv");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display PDV page", async ({ page }) => {
    // Check that the page title is visible
    await expect(
      page.getByRole("heading", { name: /ponto de venda/i }),
    ).toBeVisible();

    // Check that cash register status is visible (open or closed)
    await expect(page.getByText(/caixa fechado|caixa aberto/i)).toBeVisible();

    // Check add item section
    await expect(page.getByText(/adicionar item/i)).toBeVisible();

    // Check payment section
    await expect(page.getByText(/pagamento/i)).toBeVisible();
  });

  test("should navigate to PDV", async ({ page }) => {
    // Navigate directly to the route
    await page.goto("./pdv");
    await page.waitForLoadState("domcontentloaded");

    // Check URL
    await expect(page).toHaveURL(/.*\/pdv/);

    // Check that the page loaded with main elements
    await expect(
      page.getByRole("heading", { name: /ponto de venda/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /abrir caixa|fechar caixa/i }),
    ).toBeVisible();
  });
});
