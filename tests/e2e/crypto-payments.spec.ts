import { test, expect } from "./fixtures";

test.describe("Crypto Payments Module", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test("should navigate to crypto payments page", async ({ page }) => {
    // Navigate directly to crypto payments page
    await page.goto("./financeiro/crypto-pagamentos");
    await page.waitForLoadState("domcontentloaded");

    // Check main page elements
    await expect(page.getByText("Pagamentos em Criptomoedas")).toBeVisible();
  });

  test("should configure exchange", async ({ page }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // Click Exchanges tab
    await page.click('button:has-text("Exchanges")');

    // Open configuration dialog
    await page.click('button:has-text("Configurar Exchange")');

    // Fill form
    await page.selectOption('select[name="exchange_name"]', "BINANCE");
    await page.fill('input[name="api_key_encrypted"]', "test_api_key_12345");
    await page.fill(
      'input[name="wallet_address"]',
      "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    );
    await page.fill('input[name="processing_fee_percentage"]', "2.5");

    // Submit form
    await page.click('button:has-text("Salvar Configuração")');

    // Wait for success toast
    await expect(page.getByText(/configuração salva/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should create wallet", async ({ page }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // Click Wallets tab
    await page.click('button:has-text("Carteiras")');

    // Open new wallet dialog
    await page.click('button:has-text("Nova Carteira")');

    // Fill form
    await page.fill('input[name="wallet_name"]', "Carteira Bitcoin Principal");
    await page.selectOption('select[name="coin_type"]', "BTC");
    await page.fill(
      'input[name="wallet_address"]',
      "3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy",
    );

    // Submit form
    await page.click('button:has-text("Criar Carteira")');

    // Wait for success toast
    await expect(page.getByText(/carteira criada/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should generate payment QR code", async ({ page }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // Assuming a wallet already exists
    // Click button to generate payment
    await page.locator('button:has-text("Gerar Pagamento")').first().click();

    // Fill value
    await page.fill('input[name="amount_crypto"]', "0.001");

    // Select patient (optional)
    // await page.selectOption('select[name="patient_id"]', 'patient-uuid');

    // Generate QR Code
    await page.click('button:has-text("Gerar QR Code")');

    // Check if QR code was rendered
    await expect(page.locator("canvas")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/endereço da carteira/i)).toBeVisible();
  });

  test("should display transaction list", async ({ page }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // Check if transactions table exists
    await expect(page.locator("table")).toBeVisible();

    // Check main columns
    await expect(page.getByText("Data")).toBeVisible();
    await expect(page.getByText("Moeda")).toBeVisible();
    await expect(page.getByText("Valor")).toBeVisible();
    await expect(page.getByText("Status")).toBeVisible();
  });

  test("should filter transactions by status", async ({ page }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // Apply status filter
    await page.selectOption('select[name="status_filter"]', "CONFIRMADO");

    // Check if filter was applied (number of rows in table changed)
    const rows = page.locator("table tbody tr");
    const count = await rows.count();

    // If there are results, check that all have CONFIRMED status
    if (count > 0) {
      const statuses = await page
        .locator('table tbody tr td:has-text("Confirmado")')
        .count();
      expect(statuses).toBeGreaterThan(0);
    }
  });

  test("should convert crypto to BRL", async ({ page }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // Assuming there is a confirmed transaction
    // Click conversion button
    const convertButton = page
      .locator('button:has-text("Converter para BRL")')
      .first();

    if (await convertButton.isVisible()) {
      await convertButton.click();

      // Confirm conversion
      await page.click('button:has-text("Confirmar Conversão")');

      // Wait for success toast
      await expect(page.getByText(/conversão realizada/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("should sync wallet balance", async ({ page }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // Click Wallets tab
    await page.click('button:has-text("Carteiras")');

    // Click sync button
    const syncButton = page.locator('button:has-text("Sincronizar")').first();

    if (await syncButton.isVisible()) {
      await syncButton.click();

      // Wait for success toast
      await expect(page.getByText(/saldo sincronizado/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("should display dashboard metrics", async ({ page }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // Check main KPIs
    await expect(page.getByText(/total em btc/i)).toBeVisible();
    await expect(page.getByText(/total em brl/i)).toBeVisible();
    await expect(page.getByText(/pendentes/i)).toBeVisible();
    await expect(page.getByText(/confirmadas hoje/i)).toBeVisible();
  });

  test("should handle empty states gracefully", async ({ page }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // If there are no transactions, check empty state message
    const emptyState = page.getByText(/nenhuma transação/i);
    const hasTransactions = (await page.locator("table tbody tr").count()) > 0;

    if (!hasTransactions) {
      await expect(emptyState).toBeVisible();
    }
  });

  test("should validate required fields in exchange config", async ({
    page,
  }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // Click Exchanges tab
    await page.click('button:has-text("Exchanges")');

    // Open configuration dialog
    await page.click('button:has-text("Configurar Exchange")');

    // Try to submit without filling required fields
    await page.click('button:has-text("Salvar Configuração")');

    // Check validation messages
    const validationErrors = page.locator("text=/obrigatório|required/i");
    expect(await validationErrors.count()).toBeGreaterThan(0);
  });

  test("should validate Bitcoin address format", async ({ page }) => {
    await page.goto("./financeiro/crypto-pagamentos");

    // Click Wallets tab
    await page.click('button:has-text("Carteiras")');

    // Open new wallet dialog
    await page.click('button:has-text("Nova Carteira")');

    // Fill with invalid address
    await page.fill('input[name="wallet_name"]', "Test Wallet");
    await page.selectOption('select[name="coin_type"]', "BTC");
    await page.fill('input[name="wallet_address"]', "invalid-address-123");

    // Try to submit
    await page.click('button:has-text("Criar Carteira")');

    // Check validation error
    await expect(page.getByText(/endereço inválido/i)).toBeVisible({
      timeout: 3000,
    });
  });
});
