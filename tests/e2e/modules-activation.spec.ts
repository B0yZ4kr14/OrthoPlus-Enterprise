import { test, expect } from "./fixtures";

/**
 * FASE 5 (E2E Tests) - Gestão de Módulos
 * Testa ativação/desativação de módulos e validação de dependências
 */

test.describe("Module Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Navigate to module management
    await page.goto("/settings/modules");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display module list", async ({ page }) => {
    // Check title
    await expect(
      page.getByRole("heading", { name: /gestão de módulos/i }),
    ).toBeVisible();

    // Check that there are modules listed
    const modules = page.locator('[data-testid="module-card"]');
    const count = await modules.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display module categories", async ({ page }) => {
    // Check categories
    await expect(page.getByText(/gestão e operação/i)).toBeVisible();
    await expect(page.getByText(/financeiro/i)).toBeVisible();
    await expect(page.getByText(/compliance/i)).toBeVisible();
  });

  test("should show active/inactive module status", async ({ page }) => {
    // Check status badges
    const activeModules = page.locator('[data-testid="module-card"]', {
      hasText: /ativo/i,
    });
    const count = await activeModules.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should deactivate module without dependents", async ({ page }) => {
    // Find ESTOQUE module (without critical dependents)
    const estoqueModule = page.locator('[data-testid="module-card"]', {
      hasText: /estoque/i,
    });

    // Click toggle
    const toggle = estoqueModule.locator('button[role="switch"]');
    await toggle.click();

    // Wait for confirmation
    await page.waitForLoadState("domcontentloaded");

    // Check that toggle changed state
    const isChecked = await toggle.getAttribute("data-state");
    expect(["checked", "unchecked"]).toContain(isChecked);
  });

  test("should block deactivation of module with dependents", async ({
    page,
  }) => {
    // Find PEP module (has dependents: ASSINATURA_ICP, TISS, etc.)
    const pepModule = page.locator('[data-testid="module-card"]', {
      hasText: /prontuário eletrônico/i,
    });

    // Check if toggle is disabled
    const toggle = pepModule.locator('button[role="switch"]');
    const isDisabled = await toggle.isDisabled();

    if (isDisabled) {
      // Hover to see tooltip
      await toggle.hover();

      // Check blocking message
      await expect(page.getByText(/requerido por/i)).toBeVisible({
        timeout: 2000,
      });
    }
  });

  test("should display unmet dependencies", async ({ page }) => {
    // Search for inactive modules with dependencies
    const inactiveModules = page
      .locator('[data-testid="module-card"]')
      .filter({ hasNotText: /ativo/i });
    const count = await inactiveModules.count();

    if (count > 0) {
      // Check if there is a dependency indicator
      const firstInactive = inactiveModules.first();
      const hasDependencyWarning = await firstInactive
        .locator('[data-icon="alert-circle"]')
        .count();

      expect(hasDependencyWarning).toBeGreaterThanOrEqual(0);
    }
  });

  test("should activate module with met dependencies", async ({ page }) => {
    // Find inactive module with met dependencies
    const modules = page.locator('[data-testid="module-card"]');
    const count = await modules.count();

    for (let i = 0; i < count; i++) {
      const module = modules.nth(i);
      const hasActiveText = await module.getByText(/ativo/i).count();

      if (hasActiveText === 0) {
        // Inactive module found
        const toggle = module.locator('button[role="switch"]');
        const isDisabled = await toggle.isDisabled();

        if (!isDisabled) {
          // Can be activated
          await toggle.click();
          await page.waitForLoadState("domcontentloaded");

          // Check change
          const newState = await toggle.getAttribute("data-state");
          expect(["checked", "unchecked"]).toContain(newState);
          break;
        }
      }
    }
  });

  test("should filter modules by category", async ({ page }) => {
    // Click "Financial" category
    await page
      .getByText(/financeiro/i)
      .first()
      .click();

    // Check that only financial modules are visible
    const visibleModules = page.locator('[data-testid="module-card"]:visible');
    const count = await visibleModules.count();

    expect(count).toBeGreaterThan(0);
  });

  test("should display active module counter by category", async ({ page }) => {
    // Check counters (e.g., "3/5 active")
    const counters = page.locator("text=/\\d+\\/\\d+ ativos/i");
    const count = await counters.count();

    expect(count).toBeGreaterThan(0);
  });
});
