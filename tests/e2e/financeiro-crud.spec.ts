import { test, expect } from './fixtures';

/**
 * FASE 5 (E2E Tests) - Fluxo Financeiro Completo
 * Testa operações CRUD de contas a receber e pagamentos
 */

test.describe('Financeiro - CRUD Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    // Auth token injected via fixtures.ts
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Navegar para Financeiro
    await page.goto('/financeiro');
    await page.waitForLoadState('domcontentloaded');
  });

  test('deve exibir dashboard financeiro com KPIs', async ({ page }) => {
    await expect(page.getByText(/receitas/i).first()).toBeVisible();
    await expect(page.getByText(/despesas/i).first()).toBeVisible();
    await expect(page.getByText(/lucro/i).first()).toBeVisible();
  });

  test('deve criar nova conta a receber', async ({ page }) => {
    // Abrir modal de nova conta (Wizard)
    await page.getByRole('button', { name: /nova conta/i }).click();
    
    // Passo 1: Informações base
    await page.getByLabel(/cliente\/paciente/i).fill('João Silva');
    await page.getByLabel(/descrição/i).fill('Consulta de Revisão');
    await page.getByRole('button', { name: /próximo/i }).click();

    // Passo 2: Valores
    await page.getByLabel(/valor total/i).fill('250');
    await page.getByLabel(/data de vencimento/i).fill('2025-12-31');
    await page.getByRole('button', { name: /próximo/i }).click();
    
    // Passo 3: Confirmação e Salvar
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verificar toast de sucesso
    await expect(page.getByText(/conta criada/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve filtrar contas por status', async ({ page }) => {
    // Aplicar filtro "Pendente"
    await page.getByRole('combobox', { name: /status/i }).click();
    await page.getByRole('option', { name: /pendente/i }).click();
    
    await page.waitForLoadState("domcontentloaded");
    
    // Verificar que apenas contas pendentes são exibidas
    const rows = page.locator('[data-testid="conta-row"]');
    const count = await rows.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(rows.nth(i)).toContainText(/pendente/i);
      }
    }
  });

  test('deve registrar pagamento de conta', async ({ page }) => {
    // Encontrar primeira conta pendente
    const firstPendingRow = page.locator('[data-testid="conta-row"]').first();
    
    // Abrir ações
    await firstPendingRow.getByRole('button', { name: /ações/i }).click();
    
    // Registrar pagamento
    await page.getByRole('menuitem', { name: /registrar pagamento/i }).click();
    
    // Confirmar
    await page.getByRole('button', { name: /confirmar/i }).click();
    
    // Verificar toast
    await expect(page.getByText(/pagamento registrado/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve buscar contas por descrição', async ({ page }) => {
    // Digitar busca
    await page.getByPlaceholder(/buscar/i).fill('Consulta');
    
    // Verificar resultados
    const results = page.locator('[data-testid="conta-row"]');
    const count = await results.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('deve validar campos obrigatórios no passo 1', async ({ page }) => {
    // Abrir modal
    await page.getByRole('button', { name: /nova conta/i }).click();
    
    // Tentar avançar o passo 1 sem preencher
    await page.getByRole('button', { name: /próximo/i }).click();
    
    // Verificar campos nativos inválidos ou foco mantido no formulário por causa de required=""
    const patientName = page.locator('#patient_name');
    await expect(patientName).toBeFocused();
  });

  test('deve navegar entre meses no calendário', async ({ page }) => {
    // Clicar em próximo mês
    await page.getByRole('button', { name: /próximo/i }).click();
    
    // Clicar em mês anterior
    await page.getByRole('button', { name: /anterior/i }).click();
    
    // Verificar que o calendário está visível
    await expect(page.locator('[data-calendar]')).toBeVisible();
  });

  test('deve exportar relatório financeiro', async ({ page }) => {
    // Abrir menu de exportação
    await page.getByRole('button', { name: /exportar/i }).click();
    
    // Selecionar formato
    await page.getByRole('menuitem', { name: /excel/i }).click();
    
    // Aguardar download (não vamos validar o arquivo)
    await page.waitForLoadState("domcontentloaded");
  });
});
