import { test, expect } from '@playwright/test'

test('landing page has correct branding', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveTitle(/OrthoPlus Enterprise/)
  await expect(page.locator('h1')).toContainText('OrthoPlus Enterprise')
})
