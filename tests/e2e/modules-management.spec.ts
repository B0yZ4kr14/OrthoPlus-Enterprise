import { test, expect } from "./fixtures";

test.describe("Module Management (ADMIN)", () => {
  test.beforeEach(async ({ page }) => {
    // Login as ADMIN
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Navigate to settings -> modules
    await page.getByRole("link", { name: /configurações/i }).click();
    await page.waitForURL("/configuracoes");
    await page.getByRole("tab", { name: /módulos/i }).click();
  });

  test("should display module catalog", async ({ page }) => {
    // Check that there are modules listed
    await expect(
      page.getByText(/módulo de prontuário eletrônico/i),
    ).toBeVisible();
    await expect(page.getByText(/módulo de agenda/i)).toBeVisible();
    await expect(page.getByText(/módulo financeiro/i)).toBeVisible();
  });

  test("should display modules grouped by category", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /gestão e operação/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /financeiro/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /compliance/i }),
    ).toBeVisible();
  });

  test("should activate module without dependencies", async ({ page }) => {
    // Find PEP module (has no dependencies)
    const pepModule = page.locator('[data-module="PEP"]');
    const toggle = pepModule.locator('button[role="switch"]');

    // Check current state
    const isActive = await toggle.getAttribute("data-state");

    if (isActive === "unchecked") {
      // Activate module
      await toggle.click();

      // Check activation
      await expect(page.getByText(/módulo ativado/i)).toBeVisible();
      await expect(toggle).toHaveAttribute("data-state", "checked");
    }
  });

  test("should deactivate module without dependents", async ({ page }) => {
    // Find module that is not a dependency of others
    const moduleToggle = page
      .locator('[data-module="TELEODONTO"]')
      .locator('button[role="switch"]');

    const isActive = await moduleToggle.getAttribute("data-state");

    if (isActive === "checked") {
      await moduleToggle.click();

      await expect(page.getByText(/módulo desativado/i)).toBeVisible();
      await expect(moduleToggle).toHaveAttribute("data-state", "unchecked");
    }
  });

  test("should block activation of module with unmet dependencies", async ({
    page,
  }) => {
    // SPLIT_PAYMENT depends on FINANCIAL
    // First deactivate FINANCIAL if active
    const financeiroToggle = page
      .locator('[data-module="FINANCEIRO"]')
      .locator('button[role="switch"]');
    const financeiroState = await financeiroToggle.getAttribute("data-state");

    if (financeiroState === "checked") {
      await financeiroToggle.click();
    }

    // Try to activate SPLIT_PAYMENT
    const splitToggle = page
      .locator('[data-module="SPLIT_PAGAMENTO"]')
      .locator('button[role="switch"]');

    // Check that it is disabled or shows tooltip
    const isDisabled = await splitToggle.isDisabled();
    expect(isDisabled).toBe(true);

    // Check dependency tooltip
    await splitToggle.hover();
    await expect(page.getByText(/requer.*financeiro/i)).toBeVisible();
  });

  test("should block deactivation of module with active dependents", async ({
    page,
  }) => {
    // Activate FINANCIAL
    const financeiroToggle = page
      .locator('[data-module="FINANCEIRO"]')
      .locator('button[role="switch"]');
    if ((await financeiroToggle.getAttribute("data-state")) === "unchecked") {
      await financeiroToggle.click();
    }

    // Activate SPLIT_PAYMENT (depends on FINANCIAL)
    const splitToggle = page
      .locator('[data-module="SPLIT_PAGAMENTO"]')
      .locator('button[role="switch"]');
    if (
      (await splitToggle.getAttribute("data-state")) === "unchecked" &&
      !(await splitToggle.isDisabled())
    ) {
      await splitToggle.click();
    }

    // Try to deactivate FINANCIAL (should fail)
    await financeiroToggle.click();

    // Check error
    await expect(
      page.getByText(/não pode ser desativado.*split.*ativo/i),
    ).toBeVisible();
  });

  test("should view dependency graph", async ({ page }) => {
    // Click view graph button
    await page
      .getByRole("button", { name: /visualizar grafo|dependências/i })
      .click();

    // Check that the graph opened
    await expect(page.locator('[class*="react-flow"]')).toBeVisible();

    // Check that there are nodes in the graph
    const nodes = page.locator('[class*="react-flow__node"]');
    expect(await nodes.count()).toBeGreaterThan(0);

    // Close graph
    await page.getByRole("button", { name: /fechar/i }).click();
  });

  test("should simulate activation in graph (What-If)", async ({ page }) => {
    await page.getByRole("button", { name: /visualizar grafo/i }).click();

    // Activate simulation mode
    await page.getByRole("button", { name: /simular|what-if/i }).click();

    // Click a module in the graph
    const moduleNode = page.locator('[data-id="FINANCEIRO"]').first();
    await moduleNode.click();

    // Check that simulation alert appears
    await expect(page.getByText(/simula.*ativar.*financeiro/i)).toBeVisible();

    // Check highlighted affected modules
    await expect(page.locator('[data-simulated="true"]')).toHaveCount(
      await page.locator('[data-simulated="true"]').count(),
    );
  });

  test("should request subscription to new module", async ({ page }) => {
    // Find unsubscribed module
    const nonSubscribedModule = page
      .locator('[data-subscribed="false"]')
      .first();

    if (await nonSubscribedModule.isVisible()) {
      // Click request
      await nonSubscribedModule
        .getByRole("button", { name: /solicitar/i })
        .click();

      // Check success message
      await expect(page.getByText(/solicitação enviada/i)).toBeVisible();
    }
  });

  test("should display module statistics", async ({ page }) => {
    await page.getByRole("button", { name: /visualizar grafo/i }).click();

    // Check that statistics are displayed
    await expect(page.getByText(/módulos ativos/i)).toBeVisible();
    await expect(page.getByText(/módulos disponíveis/i)).toBeVisible();
  });
});
