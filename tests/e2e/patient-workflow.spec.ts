import { test, expect } from './fixtures';

test.describe('Patient Workflow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Assume login is already configured
  });

  test('should create patient with marketing data and canonical status', async ({ page }) => {
    // Navigate to patient registration
    await page.click('[data-testid="quick-action-new-patient"]');
    
    // Fill basic data
    await page.fill('[name="full_name"]', 'João Silva Teste');
    await page.fill('[name="cpf"]', '123.456.789-00');
    await page.fill('[name="phone"]', '(11) 98765-4321');
    await page.fill('[name="email"]', 'joao.teste@example.com');
    
    // Select canonical status
    await page.click('[data-testid="patient-status-select"]');
    await page.click('[data-value="PROSPECT"]');
    
    // Navigate to Marketing tab
    await page.click('[data-testid="tab-marketing"]');
    
    // Fill marketing data
    await page.fill('[name="marketing_campaign"]', 'Campanha Verão 2024');
    await page.fill('[name="marketing_source"]', 'Google Ads');
    await page.fill('[name="marketing_event"]', 'Feira de Saúde');
    await page.fill('[name="marketing_promoter"]', 'João Promotor');
    
    // Save patient
    await page.click('[type="submit"]');
    
    // Check success
    await expect(page.locator('text=Paciente cadastrado com sucesso')).toBeVisible();
  });

  test('should view unified patient page with 7 tabs', async ({ page }) => {
    // Navigate to patient list
    await page.goto('/pacientes');
    
    // Click first patient
    await page.click('[data-testid="patient-row"]:first-child');
    
    // Check all 7 tabs
    await expect(page.locator('[data-testid="tab-cadastro"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-prontuario"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-odontograma"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-imagens"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-tratamento"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-financeiro"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-timeline"]')).toBeVisible();
    
    // Navigate between tabs
    await page.click('[data-testid="tab-prontuario"]');
    await expect(page.locator('text=Histórico Clínico')).toBeVisible();
    
    await page.click('[data-testid="tab-timeline"]');
    await expect(page.locator('[data-testid="timeline-event"]')).toBeVisible();
  });

  test('should use global search with Cmd+K', async ({ page }) => {
    // Activate global search
    await page.keyboard.press('Meta+K');
    
    // Check search modal opened
    await expect(page.locator('[data-testid="global-search-modal"]')).toBeVisible();
    
    // Type search term
    await page.fill('[data-testid="global-search-input"]', 'João');
    
    // Wait for results
    await page.waitForSelector('[data-testid="search-result"]');
    
    // Check result categories
    await expect(page.locator('text=Pacientes')).toBeVisible();
    await expect(page.locator('text=Orçamentos')).toBeVisible();
    
    // Click result
    await page.click('[data-testid="search-result"]:first-child');
    
    // Check navigation
    await expect(page).toHaveURL(/\/pacientes\/.+/);
  });

  test('should display dynamic sidebar badges', async ({ page }) => {
    await page.goto('/');
    
    // Check badges in sidebar
    await expect(page.locator('[data-testid="badge-appointments"]')).toBeVisible();
    await expect(page.locator('[data-testid="badge-overdue"]')).toBeVisible();
    await expect(page.locator('[data-testid="badge-defaulters"]')).toBeVisible();
    await expect(page.locator('[data-testid="badge-recalls"]')).toBeVisible();
    
    // Check numeric values
    const appointmentsBadge = await page.textContent('[data-testid="badge-appointments"]');
    expect(parseInt(appointmentsBadge || '0')).toBeGreaterThanOrEqual(0);
  });

  test('should use quick actions', async ({ page }) => {
    await page.goto('/');
    
    // Check quick action buttons
    await expect(page.locator('[data-testid="quick-action-new-patient"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-schedule"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-new-sale"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-action-new-budget"]')).toBeVisible();
    
    // Test quick schedule action
    await page.click('[data-testid="quick-action-schedule"]');
    await expect(page).toHaveURL(/\/agenda/);
  });

  test('should view marketing ROI dashboard', async ({ page }) => {
    await page.goto('/dashboards/comercial');
    
    // Check main KPIs
    await expect(page.locator('[data-testid="kpi-cac"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-roi"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-converted"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-conversion-rate"]')).toBeVisible();
    
    // Check campaign ROI chart
    await expect(page.locator('[data-testid="chart-campaign-roi"]')).toBeVisible();
    
    // Check source performance table
    await expect(page.locator('[data-testid="table-source-performance"]')).toBeVisible();
  });

  test('should change patient status and track history', async ({ page }) => {
    await page.goto('/pacientes');
    await page.click('[data-testid="patient-row"]:first-child');
    
    // Go to registration tab
    await page.click('[data-testid="tab-cadastro"]');
    
    // Change status
    await page.click('[data-testid="patient-status-select"]');
    await page.click('[data-value="TRATAMENTO"]');
    
    // Save
    await page.click('[type="submit"]');
    await expect(page.locator('text=Status atualizado')).toBeVisible();
    
    // Go to timeline
    await page.click('[data-testid="tab-timeline"]');
    
    // Check status change event
    await expect(page.locator('text=Mudança de Status')).toBeVisible();
    await expect(page.locator('text=PROSPECT → TRATAMENTO')).toBeVisible();
  });
});
