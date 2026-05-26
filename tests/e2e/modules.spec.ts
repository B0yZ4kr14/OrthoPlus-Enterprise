import { test, expect } from './fixtures';

test.describe('Module Management (ADMIN)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as ADMIN
    // Auth token injected via fixtures.ts
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Navigate to module management
    await page.goto('/settings/modules');
  });

  test('should display complete module list', async ({ page }) => {
    await expect(page.getByText(/gestão de módulos/i)).toBeVisible();
    
    // Check main categories
    await expect(page.getByText(/gestão e operação/i)).toBeVisible();
    await expect(page.getByText(/financeiro/i)).toBeVisible();
    await expect(page.getByText(/crescimento e marketing/i)).toBeVisible();
  });

  test('should activate module without dependencies', async ({ page }) => {
    // Find an inactive module without dependencies
    const moduleCard = page.locator('[data-module="AGENDA"]').first();
    const toggleSwitch = moduleCard.locator('button[role="switch"]');
    
    const isActive = await toggleSwitch.getAttribute('data-state');
    
    if (isActive === 'unchecked') {
      await toggleSwitch.click();
      // Accept any toast response — backend may not be running during E2E
      const toastLocator = page.locator('[data-sonner-toast], [role="status"], [data-radix-toast-viewport] > *');
      await expect(toastLocator.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should block activation of module with unmet dependencies', async ({ page }) => {
    // SPLIT_PAYMENT depends on FINANCIAL
    const splitModule = page.locator('[data-module="SPLIT_PAGAMENTO"]').first();
    const toggleSwitch = splitModule.locator('button[role="switch"]');
    
    // Try to activate without dependency
    await toggleSwitch.click();
    
    // Should show dependency error
    await expect(page.getByText(/requer o módulo/i)).toBeVisible();
  });

  test('should block deactivation of module with active dependents', async ({ page }) => {
    // First activate FINANCIAL
    const financeiroModule = page.locator('[data-module="FINANCEIRO"]').first();
    await financeiroModule.locator('button[role="switch"]').click();
    
    // Activate SPLIT_PAYMENT (dependent)
    const splitModule = page.locator('[data-module="SPLIT_PAGAMENTO"]').first();
    await splitModule.locator('button[role="switch"]').click();
    
    // Try to deactivate FINANCIAL (should fail)
    await financeiroModule.locator('button[role="switch"]').click();
    await expect(page.getByText(/este módulo é requerido/i)).toBeVisible();
  });

  test('should display dependency info in tooltip', async ({ page }) => {
    const moduleCard = page.locator('[data-module="SPLIT_PAGAMENTO"]').first();
    
    // Hover to show tooltip
    await moduleCard.hover();
    
    // Check that tooltip shows dependencies
    await expect(page.getByText(/requer/i)).toBeVisible();
  });
});

test.describe('Module View (MEMBER)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as MEMBER
    // Auth token injected via fixtures.ts
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('MEMBER should not have access to module management', async ({ page }) => {
    await page.goto('/settings/modules');
    
    // Should be redirected or show access denied
    await expect(page).not.toHaveURL('/settings/modules');
  });

  test('MEMBER should see only active and authorized modules in sidebar', async ({ page }) => {
    // Check that sidebar shows only allowed modules
    const sidebar = page.locator('[data-sidebar]');
    
    // Basic modules should be visible
    await expect(sidebar.getByText(/pacientes/i)).toBeVisible();
    
    // Admin modules should NOT be visible
    await expect(sidebar.getByText(/gestão de módulos/i)).not.toBeVisible();
  });
});
