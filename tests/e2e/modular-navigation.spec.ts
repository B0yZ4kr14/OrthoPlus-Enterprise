/**
 * Modular Navigation E2E Tests
 * Valida navegação baseada em Bounded Contexts (DDD)
 */

import { test, expect } from "./fixtures";

test.describe("Modular Navigation (DDD)", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display all bounded contexts in sidebar", async ({ page }) => {
    // Check if all bounded contexts are visible
    const expectedContexts = [
      "PACIENTES",
      "PEP",
      "FINANCEIRO",
      "INVENTÁRIO",
      "MARKETING",
      "PDV",
      "CONFIGURAÇÕES",
      "BI",
      "COMPLIANCE",
    ];

    for (const context of expectedContexts) {
      const contextElement = await page.locator(`text=${context}`).isVisible();
      expect(contextElement).toBeTruthy();
    }
  });

  test("should navigate to PACIENTES module", async ({ page }) => {
    await page.click("text=PACIENTES");
    await page.waitForURL(/\/pacientes/);

    // Check if patients page loaded
    await expect(page.locator('h1:has-text("Pacientes")')).toBeVisible();
  });

  test("should navigate to PEP module", async ({ page }) => {
    await page.click("text=PEP");

    // Check if there are PEP sub-items
    const prontuarioLink = await page
      .locator("text=/Prontuários/i")
      .isVisible();
    expect(prontuarioLink).toBeTruthy();
  });

  test("should navigate to FINANCEIRO module", async ({ page }) => {
    await page.click("text=FINANCEIRO");

    // Check if there are financial sub-items
    const transacoesLink = await page.locator("text=/Transações/i").isVisible();
    expect(transacoesLink).toBeTruthy();
  });

  test("should navigate to INVENTORY module", async ({ page }) => {
    await page.click("text=INVENTÁRIO");

    // Check if there are inventory sub-items
    const produtosLink = await page.locator("text=/Produtos/i").isVisible();
    expect(produtosLink).toBeTruthy();
  });

  test("should highlight active bounded context", async ({ page }) => {
    await page.click("text=PACIENTES");
    await page.waitForURL(/\/pacientes/);

    // Check if the item is highlighted (active class)
    const activeItem = await page.locator('[data-active="true"]').count();
    expect(activeItem).toBeGreaterThan(0);
  });

  test("should collapse/expand sidebar", async ({ page }) => {
    // Check if toggle button exists
    const toggleButton = await page.locator('[data-testid="sidebar-trigger"]');
    await expect(toggleButton).toBeVisible();

    // Collapse sidebar
    await toggleButton.click();

    // Check if sidebar is collapsed (mini width)
    const sidebar = await page.locator('[data-testid="sidebar"]');
    const isCollapsed = await sidebar.evaluate((el) =>
      el.classList.contains("w-14"),
    );
    expect(isCollapsed).toBeTruthy();

    // Expand sidebar
    await toggleButton.click();

    // Check if sidebar is expanded
    const isExpanded = await sidebar.evaluate((el) =>
      el.classList.contains("w-60"),
    );
    expect(isExpanded).toBeTruthy();
  });

  test("should persist sidebar state", async ({ page, context }) => {
    // Collapse sidebar
    await page.click('[data-testid="sidebar-trigger"]');

    // Navigate to another page
    await page.click("text=PACIENTES");
    await page.waitForURL(/\/pacientes/);

    // Check if collapsed state persists
    const sidebar = await page.locator('[data-testid="sidebar"]');
    const isCollapsed = await sidebar.evaluate((el) =>
      el.classList.contains("w-14"),
    );
    expect(isCollapsed).toBeTruthy();
  });

  test("should show only active modules for MEMBER users", async ({ page }) => {
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click("text=Sair");

    // Login as MEMBER
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Check if only allowed modules are visible
    const configLink = await page.locator("text=CONFIGURAÇÕES").isVisible();
    expect(configLink).toBeFalsy(); // MEMBER should not see Settings
  });

  test("should render mobile menu correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if there is mobile menu
    const mobileMenu = await page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();

    // Open mobile menu
    await mobileMenu.click();

    // Check if contexts are visible in mobile menu
    const pacientesLink = await page.locator("text=PACIENTES").isVisible();
    expect(pacientesLink).toBeTruthy();
  });
});
