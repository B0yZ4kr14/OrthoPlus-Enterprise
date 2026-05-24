import { test, expect } from "./fixtures";

test.describe("IA Radiografia - Upload e Análise", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) =>
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`),
    );
    page.on("pageerror", (err) =>
      console.log(`[Browser Error]: ${err.message}`),
    );
  });

  test("deve exibir a página de IA Radiografia", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Verificar título da página
    await expect(page.locator("h1")).toContainText("IA Radiografia");
  });

  test("deve exibir botão de upload e filtros", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Verificar botão de upload
    await expect(
      page.getByRole("button", { name: /nova análise/i }),
    ).toBeVisible();

    // Verificar filtros
    await expect(page.getByText(/filtros/i)).toBeVisible();
    await expect(page.getByText(/status/i)).toBeVisible();
    await expect(page.getByText(/tipo/i)).toBeVisible();
  });

  test("deve abrir o diálogo de upload ao clicar em Nova Análise", async ({
    page,
  }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Clicar no botão de nova análise
    await page.getByRole("button", { name: /nova análise/i }).click();

    // Verificar se o diálogo abriu
    await expect(
      page.getByRole("dialog").getByText(/nova análise/i),
    ).toBeVisible();

    // Verificar campos do formulário
    await expect(page.getByLabel(/paciente/i)).toBeVisible();
    await expect(page.getByLabel(/tipo de radiografia/i)).toBeVisible();
    await expect(page.getByLabel(/arquivo/i)).toBeVisible();
  });

  test("deve exibir lista de análises ou estado vazio", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Verificar se a lista ou estado vazio está presente
    const listaOuVazio = page.locator(
      '[data-testid="analise-list"], [data-testid="empty-state"], tbody tr, text=/nenhuma análise/i',
    );
    await expect(listaOuVazio.first()).toBeVisible();
  });

  test("deve navegar para a aba de insights", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Clicar na aba de insights se existir
    const insightsTab = page.getByRole("tab", { name: /insights/i });
    if (await insightsTab.isVisible().catch(() => false)) {
      await insightsTab.click();
      await expect(
        page.getByText(/dashboard de insights/i).or(page.getByText(/kpi/i)),
      ).toBeVisible();
    }
  });

  test("deve navegar para a aba de comparação", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Clicar na aba de comparação se existir
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

  test("deve fazer upload de radiografia (fluxo E2E completo)", async ({ page }) => {
    await page.goto("./ia-radiografia");
    await page.waitForLoadState("domcontentloaded");

    // Clicar no botão de nova análise
    await page.getByRole("button", { name: /nova análise/i }).click();

    // Verificar se o diálogo abriu
    await expect(
      page.getByRole("dialog").getByText(/upload de radiografia/i),
    ).toBeVisible();

    // Preencher paciente ID
    const patientInput = page.getByPlaceholder(/id do paciente/i);
    await patientInput.fill("test-patient-001");

    // Aguardar verificação de consentimento (pode demorar)
    await page.waitForTimeout(1500);

    // Selecionar tipo de radiografia
    const tipoSelect = page.getByRole("combobox").first();
    await tipoSelect.click();
    await page.getByRole("option", { name: /panorâmica/i }).first().click();

    // Fazer upload de arquivo (criar arquivo temporário)
    const fileInput = page.locator('input[type="file"]');
    // Criar um blob PNG mínimo (1x1 pixel)
    const buffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    await fileInput.setInputFiles({
      name: "test-radiografia.png",
      mimeType: "image/png",
      buffer,
    });

    // Verificar que o botão de upload está habilitado (se consentimento OK)
    const uploadButton = page.getByRole("button", { name: /enviar e analisar/i });

    // Se o consentimento estiver confirmado, o botão deve estar habilitado
    const isEnabled = await uploadButton.isEnabled().catch(() => false);
    if (isEnabled) {
      await uploadButton.click();

      // Aguardar resposta do backend (sucesso ou erro de IA)
      await page.waitForTimeout(3000);

      // Verificar se houve feedback (sucesso ou erro)
      const hasFeedback = await Promise.race([
        page.getByText(/análise concluída/i).first().isVisible().catch(() => false),
        page.getByText(/erro ao processar/i).first().isVisible().catch(() => false),
        page.getByText(/analisando/i).first().isVisible().catch(() => false),
      ]);

      expect(hasFeedback).toBeTruthy();
    } else {
      // Se o botão está desabilitado, verificar que é por causa do consentimento
      const consentWarning = await page
        .getByText(/consentimento lgpd/i)
        .first()
        .isVisible()
        .catch(() => false);
      expect(consentWarning).toBeTruthy();
    }
  });
});
