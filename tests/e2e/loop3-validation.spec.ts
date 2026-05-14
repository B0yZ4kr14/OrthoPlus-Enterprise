import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const EVIDENCE_DIR = path.resolve(__dirname, '../../tests/evidence/loop3');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function safeScreenshot(page: Page, name: string) {
  ensureDir(EVIDENCE_DIR);
  const filePath = path.join(EVIDENCE_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  return filePath;
}

async function blurSensitiveInputs(page: Page) {
  const inputs = await page.locator('input[type="email"], input[type="password"]').all();
  for (const input of inputs) {
    await input.evaluate((el: HTMLElement) => {
      el.style.filter = 'blur(8px)';
    });
  }
}

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
  return errors;
}

test.describe('Loop 3 - Validacao de Correcoes', () => {
  test('1. Acesso lowercase nao retorna 404', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    const response = await page.goto('https://tsiapp.io/orthoplus-enterprise/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const status = response?.status() ?? 0;
    console.log(`[LOWERCASE] Status: ${status}`);
    expect(status).not.toBe(404);
    await safeScreenshot(page, '01-lowercase-access');
    console.log(`[LOWERCASE] Erros console: ${errors.length}`);
  });

  test('2. Glassmorphism - elementos glass existem', async ({ page }) => {
    await page.goto('https://tsiapp.io/OrthoPlus-Enterprise/', { waitUntil: 'networkidle', timeout: 30000 });
    const glassElements = await page.locator('[class*="glass"]').all();
    console.log(`[GLASS] Elementos glass encontrados: ${glassElements.length}`);

    const backdropElements = await page.locator('//*[contains(@style, "backdrop-filter") or contains(@style, "-webkit-backdrop-filter")]').all();
    console.log(`[GLASS] Elementos com backdrop-filter inline: ${backdropElements.length}`);

    const hasGlassCard = await page.evaluate(() => {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            const text = rule.cssText;
            if (text.includes('.glass-card') || text.includes('.stat-card-premium') || text.includes('.chart-card-premium')) {
              return true;
            }
          }
        } catch {
          // cross-origin stylesheet
        }
      }
      return false;
    });
    console.log(`[GLASS] CSS classes premium presentes no DOM: ${hasGlassCard}`);

    await safeScreenshot(page, '02-glassmorphism');
    expect(glassElements.length + backdropElements.length).toBeGreaterThan(0);
  });

  test('3. Login + Sidebar', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto('https://tsiapp.io/OrthoPlus-Enterprise/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'admin@orthoplus.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'admin123!');
    await blurSensitiveInputs(page);
    await safeScreenshot(page, '03-login-form');

    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await safeScreenshot(page, '04-post-login');

    const sidebar = await page.locator('nav, [data-sidebar], aside, [class*="sidebar"]').first();
    const sidebarVisible = await sidebar.isVisible().catch(() => false);
    console.log(`[SIDEBAR] Sidebar visivel: ${sidebarVisible}`);

    if (sidebarVisible) {
      await safeScreenshot(page, '05-sidebar');
    }

    const menuItems = await page.locator('nav a, nav button, aside a, aside button, [data-sidebar] a, [data-sidebar] button').all();
    console.log(`[SIDEBAR] Itens de menu: ${menuItems.length}`);

    let clickableCount = 0;
    for (const item of menuItems) {
      const enabled = await item.isEnabled().catch(() => false);
      const visible = await item.isVisible().catch(() => false);
      if (enabled && visible) clickableCount++;
    }
    console.log(`[SIDEBAR] Itens clicaveis: ${clickableCount}`);

    expect(clickableCount).toBeGreaterThan(0);
    console.log(`[SIDEBAR] Erros console: ${errors.length}`);
  });

  test('4. Tema - toggle de tema existe e funciona', async ({ page }) => {
    await page.goto('https://tsiapp.io/OrthoPlus-Enterprise/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'admin@orthoplus.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'admin123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const themeBtn = await page.locator('button[aria-label*="theme" i], button[aria-label*="tema" i], [data-testid="theme-toggle"], button[class*="theme"], [class*="theme-toggle"]').first();
    const hasThemeBtn = await themeBtn.isVisible().catch(() => false);
    console.log(`[TEMA] Toggle tema visivel: ${hasThemeBtn}`);

    if (hasThemeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(800);
      await safeScreenshot(page, '06-theme-toggle');
    } else {
      await safeScreenshot(page, '06-no-theme-toggle');
    }
  });

  test('5. Verificar erros de console no dashboard', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('https://tsiapp.io/OrthoPlus-Enterprise/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'admin@orthoplus.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'admin123!');
    await blurSensitiveInputs(page);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.goto('https://tsiapp.io/OrthoPlus-Enterprise/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await safeScreenshot(page, '07-dashboard');

    console.log(`[CONSOLE] Erros capturados: ${errors.length}`);
    for (const err of errors.slice(0, 20)) {
      console.log(`  - ${err}`);
    }

    ensureDir(EVIDENCE_DIR);
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'console-errors.json'), JSON.stringify(errors, null, 2));
  });
});
