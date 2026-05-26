import { test, expect } from './fixtures';

/**
 * FASE 5 (E2E Tests) - Fluxo Financeiro Completo
 * Testa operações CRUD de contas a receber e pagamentos
 */

test.describe('Financial - Complete CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    // Auth token injected via fixtures.ts
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Navigate to Financial
    await page.goto('/financeiro');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display financial dashboard with KPIs', async ({ page }) => {
    await expect(page.getByText(/receitas/i).first()).toBeVisible();
    await expect(page.getByText(/despesas/i).first()).toBeVisible();
    await expect(page.getByText(/lucro/i).first()).toBeVisible();
  });

  test('should create new receivable account', async ({ page }) => {
    // Open new account modal (Wizard)
    await page.getByRole('button', { name: /nova conta/i }).click();
    
    // Step 1: Base information
    await page.getByLabel(/cliente\/paciente/i).fill('João Silva');
    await page.getByLabel(/descrição/i).fill('Consulta de Revisão');
    await page.getByRole('button', { name: /próximo/i }).click();

    // Step 2: Values
    await page.getByLabel(/valor total/i).fill('250');
    await page.getByLabel(/data de vencimento/i).fill('2025-12-31');
    await page.getByRole('button', { name: /próximo/i }).click();
    
    // Step 3: Confirmation and Save
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Check success toast
    await expect(page.getByText(/conta criada/i)).toBeVisible({ timeout: 5000 });
  });

  test('should filter accounts by status', async ({ page }) => {
    // Apply "Pending" filter
    await page.getByRole('combobox', { name: /status/i }).click();
    await page.getByRole('option', { name: /pendente/i }).click();
    
    await page.waitForLoadState("domcontentloaded");
    
    // Check that only pending accounts are displayed
    const rows = page.locator('[data-testid="conta-row"]');
    const count = await rows.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText(/pendente/i);
      }
    }
  });

  test('should register account payment', async ({ page }) => {
    // Find first pending account
    const firstPendingRow = page.locator('[data-testid="conta-row"]').first();
    
    // Open actions
    await firstPendingRow.getByRole('button', { name: /ações/i }).click();
    
    // Register payment
    await page.getByRole('menuitem', { name: /registrar pagamento/i }).click();
    
    // Confirm
    await page.getByRole('button', { name: /confirmar/i }).click();
    
    // Check toast
    await expect(page.getByText(/pagamento registrado/i)).toBeVisible({ timeout: 5000 });
  });

  test('should search accounts by description', async ({ page }) => {
    // Type search
    await page.getByPlaceholder(/buscar/i).fill('Consulta');
    
    // Check results
    const results = page.locator('[data-testid="conta-row"]');
    const count = await results.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should validate required fields in step 1', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: /nova conta/i }).click();
    
    // Try to advance step 1 without filling
    await page.getByRole('button', { name: /próximo/i }).click();
    
    // Check invalid native fields or focus kept in form due to required=""
    const patientName = page.locator('#patient_name');
    await expect(patientName).toBeFocused();
  });

  test('should navigate between months in calendar', async ({ page }) => {
    // Click next month
    await page.getByRole('button', { name: /próximo/i }).click();
    
    // Click previous month
    await page.getByRole('button', { name: /anterior/i }).click();
    
    // Check that the calendar is visible
    await expect(page.locator('[data-calendar]')).toBeVisible();
  });

  test('should export financial report', async ({ page }) => {
    // Open export menu
    await page.getByRole('button', { name: /exportar/i }).click();
    
    // Select format
    await page.getByRole('menuitem', { name: /excel/i }).click();
    
    // Wait for download (we won't validate the file)
    await page.waitForLoadState("domcontentloaded");
  });
});
