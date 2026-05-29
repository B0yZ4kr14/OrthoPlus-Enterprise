import { test, expect } from "./fixtures";

test.describe("Navigation E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should navigate through 5 bounded contexts", async ({ page }) => {
    // CLINIC
    await page.click('[data-testid="menu-clinica"]');
    await expect(page.locator("text=Pacientes")).toBeVisible();
    await expect(page.locator("text=Agenda")).toBeVisible();

    // FINANCIAL
    await page.click('[data-testid="menu-financeiro"]');
    await expect(page.locator("text=Contas a Receber")).toBeVisible();
    await expect(page.locator("text=PDV")).toBeVisible();
    await expect(page.locator("text=Notas Fiscais")).toBeVisible();

    // OPERATIONS
    await page.click('[data-testid="menu-operacoes"]');
    await expect(page.locator("text=Estoque")).toBeVisible();

    // GROWTH
    await page.click('[data-testid="menu-crescimento"]');
    await expect(page.locator("text=CRM")).toBeVisible();
    await expect(page.locator("text=Marketing")).toBeVisible();

    // SETTINGS
    await page.click('[data-testid="menu-configuracoes"]');
    await expect(page.locator("text=Gestão de Módulos")).toBeVisible();
  });

  test("should collapse and expand sidebar", async ({ page }) => {
    // Check expanded sidebar
    await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute(
      "data-collapsed",
      "false",
    );

    // Collapse
    await page.click('[data-testid="sidebar-toggle"]');
    await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute(
      "data-collapsed",
      "true",
    );

    // Expand
    await page.click('[data-testid="sidebar-toggle"]');
    await expect(page.locator('[data-testid="sidebar"]')).toHaveAttribute(
      "data-collapsed",
      "false",
    );
  });

  test("should navigate to missing pages", async ({ page }) => {
    // Notas Fiscais
    await page.goto("/financeiro/fiscal/notas");
    await expect(page.locator("text=Notas Fiscais")).toBeVisible();

    // Bank Reconciliation
    await page.goto("/financeiro/conciliacao");
    await expect(page.locator("text=Conciliação Bancária")).toBeVisible();

    // Fluxo Digital
    await page.goto("/fluxo-digital");
    await expect(page.locator("text=Fluxo Digital")).toBeVisible();

    // Scanner Mobile
    await page.goto("/estoque/scanner");
    await expect(page.locator("text=Scanner Mobile")).toBeVisible();

    // Communication
    await page.goto("/comunicacao");
    await expect(page.locator("text=Comunicação")).toBeVisible();
  });
});
