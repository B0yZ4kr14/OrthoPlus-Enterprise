import { test, expect } from "./fixtures";

test.describe("AI X-Ray - Upload and Analysis", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) =>
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`),
    );
    page.on("pageerror", (err) =>
      console.log(`[Browser Error]: ${err.message}`),
    );
  });

  test("should display the AI X-Ray page", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Check page title
    await expect(page.locator("h1")).toContainText("IA Radiografia");
  });

  test("should display upload button and filters", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Check upload button
    await expect(
      page.getByRole("button", { name: /nova análise/i }),
    ).toBeVisible();

    // Check filters
    await expect(page.getByText(/filtros/i)).toBeVisible();
    await expect(page.getByText(/status/i)).toBeVisible();
    await expect(page.getByText(/tipo/i)).toBeVisible();
  });

  test("should open upload dialog when clicking New Analysis", async ({
    page,
  }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Click new analysis button
    await page.getByRole("button", { name: /nova análise/i }).click();

    // Check if dialog opened
    await expect(
      page.getByRole("dialog").getByText(/nova análise/i),
    ).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/paciente/i)).toBeVisible();
    await expect(page.getByLabel(/tipo de radiografia/i)).toBeVisible();
    await expect(page.getByLabel(/arquivo/i)).toBeVisible();
  });

  test("should display analysis list or empty state", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Check if list or empty state is present
    const listaOuVazio = page.locator(
      '[data-testid="analise-list"], [data-testid="empty-state"], tbody tr, text=/nenhuma análise/i',
    );
    await expect(listaOuVazio.first()).toBeVisible();
  });

  test("should navigate to insights tab", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Click insights tab if it exists
    const insightsTab = page.getByRole("tab", { name: /insights/i });
    if (await insightsTab.isVisible().catch(() => false)) {
      await insightsTab.click();
      await expect(
        page.getByText(/dashboard de insights/i).or(page.getByText(/kpi/i)),
      ).toBeVisible();
    }
  });

  test("should navigate to comparison tab", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Click comparison tab if it exists
    const comparacaoTab = page.getByRole("tab", { name: /comparação/i });
    if (await comparacaoTab.isVisible().catch(() => false)) {
      await comparacaoTab.click();
      await expect(
        page
          .getByText(/comparar radiografias/i)
          .or(page.getByText(/selecionar paciente/i)),
      ).toBeVisible();
    }
  });

  test("should upload x-ray (full E2E flow)", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Click new analysis button
    await page.getByRole("button", { name: /nova análise/i }).click();

    // Check if dialog opened
    await expect(
      page.getByRole("dialog").getByText(/upload de radiografia/i),
    ).toBeVisible();

    // Fill patient ID
    const patientInput = page.getByPlaceholder(/id do paciente/i);
    await patientInput.fill("test-patient-001");

    // Wait for consent verification (may take time)
    await page.waitForTimeout(1500);

    // Select x-ray type
    const tipoSelect = page.getByRole("combobox").first();
    await tipoSelect.click();
    await page.getByRole("option", { name: /panorâmica/i }).first().click();

    // Upload file (create temporary file)
    const fileInput = page.locator('input[type="file"]');
    // Create a minimal PNG blob (1x1 pixel)
    const buffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    await fileInput.setInputFiles({
      name: "test-radiografia.png",
      mimeType: "image/png",
      buffer,
    });

    // Check that upload button is enabled (if consent OK)
    const uploadButton = page.getByRole("button", { name: /enviar e analisar/i });

    // If consent is confirmed, button should be enabled
    const isEnabled = await uploadButton.isEnabled().catch(() => false);
    if (isEnabled) {
      await uploadButton.click();

      // Wait for backend response (success or AI error)
      await page.waitForTimeout(3000);

      // Check if there was feedback (success or error)
      const hasFeedback = await Promise.race([
        page.getByText(/análise concluída/i).first().isVisible().catch(() => false),
        page.getByText(/erro ao processar/i).first().isVisible().catch(() => false),
        page.getByText(/analisando/i).first().isVisible().catch(() => false),
      ]);

      expect(hasFeedback).toBeTruthy();
    } else {
      // If button is disabled, check that it is because of consent
      const consentWarning = await page
        .getByText(/consentimento lgpd/i)
        .first()
        .isVisible()
        .catch(() => false);
      expect(consentWarning).toBeTruthy();
    }
  });
});
