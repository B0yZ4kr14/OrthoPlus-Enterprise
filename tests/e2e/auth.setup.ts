import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/e2e/.auth/state.json';

setup('authenticate', async ({ page }) => {
  await page.goto('./auth');
  await page.locator('input[name="email"]').fill('admin@orthoplus.com');
  await page.locator('input[name="password"]').fill('admin123!');
  await page.locator('button[type="submit"]').click();
  
  // Wait for redirect to dashboard or any protected page
  await page.waitForURL(/\/dashboard|\/pacientes|\/agenda/, { timeout: 10000 });
  
  // Save storage state
  await page.context().storageState({ path: authFile });
});
