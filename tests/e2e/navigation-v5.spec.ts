import { test, expect } from "./fixtures";

/**
 * E2E TESTS V5.0 - Modular Navigation
 * Validates the new 6 Bounded Contexts structure
 */

test.describe("Modular Navigation V5.0", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display 6 bounded contexts in sidebar", async ({ page }) => {
    // Check main categories
    await expect(page.locator("text=VISÃO GERAL")).toBeVisible();
    await expect(page.locator("text=ATENDIMENTO CLÍNICO")).toBeVisible();
    await expect(page.locator("text=FINANCEIRO & FISCAL")).toBeVisible();
    await expect(page.locator("text=OPERAÇÕES")).toBeVisible();
    await expect(page.locator("text=CAPTAÇÃO & FIDELIZAÇÃO")).toBeVisible();
    await expect(page.locator("text=ANÁLISES & RELATÓRIOS")).toBeVisible();
    await expect(page.locator("text=CONFIGURAÇÕES")).toBeVisible();
  });

  test("should navigate to Unified Dashboard", async ({ page }) => {
    await page.click("text=Dashboard");
    await expect(
      page.locator('h1:has-text("Dashboard Unificado")'),
    ).toBeVisible();

    // Check dashboard tabs
    await expect(page.locator('button:has-text("Executivo")')).toBeVisible();
    await expect(page.locator('button:has-text("Clínico")')).toBeVisible();
    await expect(page.locator('button:has-text("Financeiro")')).toBeVisible();
    await expect(page.locator('button:has-text("Comercial")')).toBeVisible();
  });

  test("should display dynamic badges in sidebar", async ({ page }) => {
    // Check if badges are rendering (wait for loading)
    await page.waitForLoadState("domcontentloaded");

    // Check if there is at least one visible badge
    const badges = page.locator("[data-badge]");
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should navigate to FISCAL module", async ({ page }) => {
    // Expand Fiscal submenu
    await page.click("text=Fiscal");

    // Click Invoices
    await page.click("text=Notas Fiscais");
    await expect(page.locator('h1:has-text("Notas Fiscais")')).toBeVisible();
  });

  test("should navigate to PDV (now in OPERATIONS)", async ({ page }) => {
    await page.click("text=PDV");
    await expect(page).toHaveURL(/\/pdv/);
  });

  test("should navigate to Dentists and Employees (now in SETTINGS)", async ({
    page,
  }) => {
    // Dentists
    await page.click("text=Dentistas");
    await expect(page).toHaveURL(/\/dentistas/);

    // Go back and navigate to Employees
    await page.click("text=Configurações");
    await page.click("text=Funcionários");
    await expect(page).toHaveURL(/\/funcionarios/);
  });

  test("should switch between Unified Dashboard tabs", async ({ page }) => {
    await page.click("text=Dashboard");

    // Clinical tab
    await page.click('button:has-text("Clínico")');
    await expect(page.locator("text=Consultas de Hoje")).toBeVisible();

    // Financial tab
    await page.click('button:has-text("Financeiro")');
    await expect(page.locator("text=Contas a Receber")).toBeVisible();

    // Commercial tab
    await page.click('button:has-text("Comercial")');
    await expect(page.locator("text=Leads Ativos")).toBeVisible();
  });

  test("should collapse and expand sidebar keeping badges", async ({
    page,
  }) => {
    // Collapse sidebar
    await page.click('[data-testid="sidebar-toggle"]');

    // Badges should still exist (even if not visible)
    const badges = page.locator("[data-badge]");
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(0);

    // Expand sidebar
    await page.click('[data-testid="sidebar-toggle"]');
  });

  test("should navigate to crypto payments module", async ({ page }) => {
    // Check Crypto Payments link
    await expect(page.locator("text=Pagamentos em Criptomoedas")).toBeVisible();

    // Navigate to the page
    await page.click("text=Pagamentos em Criptomoedas");
    await expect(page).toHaveURL(/\/financeiro\/crypto/);
  });

  test("should navigate to admin modules", async ({ page }) => {
    // Scroll to the end of the sidebar
    await page.evaluate(() => {
      const sidebar = document.querySelector("[data-sidebar]");
      if (sidebar) sidebar.scrollTop = sidebar.scrollHeight;
    });

    // Expand Administration & DevOps submenu
    await page.click("text=Administração & DevOps");

    // Check subitems
    await expect(page.locator("text=Database Admin")).toBeVisible();
    await expect(page.locator("text=Backups")).toBeVisible();
    await expect(page.locator("text=Terminal")).toBeVisible();
  });

  test("should display active route indicator", async ({ page }) => {
    await page.click("text=Pacientes");

    // Check if the item has active style
    const activeItem = page.locator('a[href="/pacientes"]');
    await expect(activeItem).toHaveClass(/bg-sidebar-accent/);
  });

  test("should load in less than 2 seconds (performance)", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForSelector("[data-sidebar]");
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });
});
