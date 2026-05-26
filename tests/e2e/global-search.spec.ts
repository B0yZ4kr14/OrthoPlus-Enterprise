import { test, expect } from './fixtures'

test.describe('Global Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pacientes')
    await page.waitForLoadState('domcontentloaded')
  })

  test('should open search modal with keyboard shortcut', async ({ page }) => {
    const isMac = await page.evaluate(() => navigator.platform.toUpperCase().indexOf('MAC') >= 0)
    await page.keyboard.press(isMac ? 'Meta+k' : 'Control+k')

    const dialog = page.locator('role=dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByPlaceholder(/buscar pacientes/i)).toBeVisible()
  })

  test('should open search modal by clicking search icon', async ({ page }) => {
    const trigger = page.locator('button[aria-label="Abrir busca global"]')
    await expect(trigger).toBeVisible()
    await trigger.click()

    const dialog = page.locator('role=dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByPlaceholder(/buscar pacientes/i)).toBeVisible()
  })

  test('should display search results for patient query', async ({ page }) => {
    await page.locator('button[aria-label="Abrir busca global"]').click()
    await expect(page.locator('role=dialog')).toBeVisible()

    const input = page.getByPlaceholder(/buscar pacientes/i)
    await input.fill('a')
    await page.waitForTimeout(500)

    // Wait for loading to finish and either results or empty state to appear
    await page.waitForFunction(() => {
      const loading = document.body.innerText.includes('Buscando...')
      const hasResults = document.querySelector('[cmdk-item]') !== null
      const emptyState = document.body.innerText.includes('Nenhum resultado encontrado')
      return !loading && (hasResults || emptyState)
    }, { timeout: 10000 })

    const results = page.locator('[cmdk-item]')
    const count = await results.count()

    if (count === 0) {
      test.skip(true, 'No search data available — skipping patient result assertion')
    }

    await expect(results.first()).toBeVisible()
  })

  test('should filter results by module', async ({ page }) => {
    await page.locator('button[aria-label="Abrir busca global"]').click()
    await expect(page.locator('role=dialog')).toBeVisible()

    const input = page.getByPlaceholder(/buscar pacientes/i)
    await input.fill('a')
    await page.waitForTimeout(500)

    await page.waitForFunction(() => {
      const loading = document.body.innerText.includes('Buscando...')
      const hasResults = document.querySelector('[cmdk-item]') !== null
      const emptyState = document.body.innerText.includes('Nenhum resultado encontrado')
      return !loading && (hasResults || emptyState)
    }, { timeout: 10000 })

    const moduleBadges = page.locator('[cmdk-group-heading] >> text=/Pacientes|Agendamentos|Prontuários/i')
    const badgeCount = await moduleBadges.count()

    if (badgeCount === 0) {
      test.skip(true, 'No search data available — skipping module filter assertion')
    }

    await expect(moduleBadges.first()).toBeVisible()
  })

  test('should navigate to patient detail on result click', async ({ page }) => {
    await page.locator('button[aria-label="Abrir busca global"]').click()
    await expect(page.locator('role=dialog')).toBeVisible()

    const input = page.getByPlaceholder(/buscar pacientes/i)
    await input.fill('a')
    await page.waitForTimeout(500)

    await page.waitForFunction(() => {
      const loading = document.body.innerText.includes('Buscando...')
      const hasResults = document.querySelector('[cmdk-item]') !== null
      const emptyState = document.body.innerText.includes('Nenhum resultado encontrado')
      return !loading && (hasResults || emptyState)
    }, { timeout: 10000 })

    const patientGroup = page.locator('[cmdk-group]').filter({ hasText: /Pacientes/i })
    const patientItems = patientGroup.locator('[cmdk-item]')
    const count = await patientItems.count()

    if (count === 0) {
      test.skip(true, 'No patient search results available — skipping navigation assertion')
    }

    // Click the first patient result
    await patientItems.first().click()

    // Wait for navigation
    await page.waitForURL(/\/pacientes\/.+/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/pacientes\/.+/)
  })

  test('should show empty state when no results', async ({ page }) => {
    await page.locator('button[aria-label="Abrir busca global"]').click()
    await expect(page.locator('role=dialog')).toBeVisible()

    const input = page.getByPlaceholder(/buscar pacientes/i)
    await input.fill('xyznotfound12345')
    await page.waitForTimeout(500)

    // Wait for loading to finish
    await page.waitForFunction(() => {
      return !document.body.innerText.includes('Buscando...')
    }, { timeout: 10000 })

    await expect(page.getByText(/nenhum resultado encontrado/i)).toBeVisible()
  })

  test('should close modal on Escape key', async ({ page }) => {
    await page.locator('button[aria-label="Abrir busca global"]').click()
    const dialog = page.locator('role=dialog')
    await expect(dialog).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })

  test('should show loading state during search', async ({ page }) => {
    await page.locator('button[aria-label="Abrir busca global"]').click()
    await expect(page.locator('role=dialog')).toBeVisible()

    const input = page.getByPlaceholder(/buscar pacientes/i)
    await input.fill('test')

    // Loading indicator should appear immediately after typing
    await expect(page.getByText(/buscando/i)).toBeVisible()
  })
})
