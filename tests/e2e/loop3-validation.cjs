const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.resolve(__dirname, '../evidence/loop3');
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function safeScreenshot(page, name) {
  ensureDir(EVIDENCE_DIR);
  const filePath = path.join(EVIDENCE_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`[EVIDENCE] Screenshot salvo: ${filePath}`);
  return filePath;
}

async function blurSensitiveInputs(page) {
  const inputs = await page.locator('input').all();
  for (const input of inputs) {
    const type = await input.getAttribute('type').catch(() => '');
    if (type === 'email' || type === 'password' || type === 'text') {
      await input.evaluate((el) => { el.style.filter = 'blur(8px)'; });
    }
  }
}

async function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-font-subpixel-positioning', '--disable-features=FontAccess'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const allErrors = [];
  let verdict = true;

  try {
    // 1. Testar acesso lowercase
    console.log('\n=== TESTE 1: Acesso lowercase ===');
    const response = await page.goto('https://tsiapp.io/orthoplus-enterprise/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const status = response?.status() ?? 0;
    console.log(`[LOWERCASE] Status HTTP: ${status}`);
    if (status === 404) {
      console.log('[LOWERCASE] FALHA: retornou 404');
      verdict = false;
    } else {
      console.log('[LOWERCASE] OK: nao retornou 404');
    }
    await safeScreenshot(page, '01-lowercase-access');

    // 2. Glassmorphism - verificar se classes existem no CSS
    console.log('\n=== TESTE 2: Glassmorphism (CSS classes) ===');
    await page.goto('https://tsiapp.io/OrthoPlus-Enterprise/', { waitUntil: 'networkidle', timeout: 30000 });
    const hasPremiumCSS = await page.evaluate(() => {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            const text = rule.cssText;
            if (text.includes('.glass-card') || text.includes('.stat-card-premium') || text.includes('.chart-card-premium')) {
              return true;
            }
          }
        } catch (e) { /* cross-origin */ }
      }
      return false;
    });
    console.log(`[GLASS] CSS classes premium (.glass-card, .stat-card-premium, .chart-card-premium) presentes: ${hasPremiumCSS}`);

    const glassElements = await page.locator('[class*="glass"]').all();
    console.log(`[GLASS] Elementos glass na landing page: ${glassElements.length}`);

    if (!hasPremiumCSS) {
      console.log('[GLASS] FALHA: classes premium nao encontradas no CSS');
      verdict = false;
    } else {
      console.log('[GLASS] OK: classes premium existem no CSS');
    }
    await safeScreenshot(page, '02-glassmorphism');

    // 3. Login + Sidebar
    console.log('\n=== TESTE 3: Login + Sidebar ===');
    const loginErrors = await collectConsoleErrors(page);
    await page.goto('https://tsiapp.io/OrthoPlus-Enterprise/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Tentar preencher email por varios seletores
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i], input[placeholder*="usuario" i], input[name="email"], input[name="username"]').first();
    const passwordInput = page.locator('input[type="password"], input[placeholder*="senha" i], input[name="password"]').first();

    let emailFilled = false;
    let passwordFilled = false;

    try {
      await emailInput.fill(process.env.TEST_EMAIL || 'admin@orthoplus.com');
      emailFilled = true;
    } catch (e) {
      console.log(`[LOGIN] Falha ao preencher email: ${e.message}`);
    }

    try {
      await passwordInput.fill(process.env.TEST_PASSWORD || 'admin123!');
      passwordFilled = true;
    } catch (e) {
      console.log(`[LOGIN] Falha ao preencher senha: ${e.message}`);
    }

    if (!emailFilled || !passwordFilled) {
      console.log('[LOGIN] FALHA: nao conseguiu preencher credenciais');
      verdict = false;
      await safeScreenshot(page, '99-login-fail');
    } else {
      await blurSensitiveInputs(page);
      await safeScreenshot(page, '03-login-form');

      const submitBtn = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();
      await submitBtn.click();
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(3000);

      await safeScreenshot(page, '04-post-login');

      // Verificar glassmorphism no dashboard
      const dashGlass = await page.locator('[class*="glass"]').all();
      console.log(`[GLASS-DASH] Elementos glass no dashboard: ${dashGlass.length}`);

      // Verificar sidebar
      const sidebarLoc = page.locator('nav, [data-sidebar], aside, [class*="sidebar"]').first();
      const sidebarVisible = await sidebarLoc.isVisible().catch(() => false);
      console.log(`[SIDEBAR] Sidebar visivel: ${sidebarVisible}`);

      if (sidebarVisible) {
        await safeScreenshot(page, '05-sidebar');
      } else {
        console.log('[SIDEBAR] AVISO: sidebar nao visivel');
      }

      const menuItems = await page.locator('nav a, nav button, aside a, aside button, [data-sidebar] a, [data-sidebar] button').all();
      console.log(`[SIDEBAR] Total itens de menu: ${menuItems.length}`);

      let clickableCount = 0;
      for (const item of menuItems) {
        const enabled = await item.isEnabled().catch(() => false);
        const visible = await item.isVisible().catch(() => false);
        if (enabled && visible) clickableCount++;
      }
      console.log(`[SIDEBAR] Itens clicaveis: ${clickableCount}`);

      if (clickableCount === 0) {
        console.log('[SIDEBAR] FALHA: nenhum item clicavel');
        verdict = false;
      } else {
        console.log('[SIDEBAR] OK');
      }
    }
    allErrors.push(...loginErrors);

    // 4. Tema
    console.log('\n=== TESTE 4: Toggle de Tema ===');
    const themeBtn = page.locator('button[aria-label*="theme" i], button[aria-label*="tema" i], [data-testid="theme-toggle"], button[class*="theme" i], [class*="theme-toggle"]').first();
    const hasThemeBtn = await themeBtn.isVisible().catch(() => false);
    console.log(`[TEMA] Toggle tema visivel: ${hasThemeBtn}`);
    if (hasThemeBtn) {
      await themeBtn.click();
      await page.waitForTimeout(800);
      await safeScreenshot(page, '06-theme-toggle');
      console.log('[TEMA] OK');
    } else {
      await safeScreenshot(page, '06-no-theme-toggle');
      console.log('[TEMA] AVISO: toggle nao encontrado');
    }

    // 5. Console errors no dashboard
    console.log('\n=== TESTE 5: Erros de console no dashboard ===');
    const dashErrors = await collectConsoleErrors(page);
    await page.goto('https://tsiapp.io/OrthoPlus-Enterprise/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
    await safeScreenshot(page, '07-dashboard');

    console.log(`[CONSOLE] Erros capturados: ${dashErrors.length}`);
    for (const err of dashErrors.slice(0, 20)) {
      console.log(`  - ${err}`);
    }
    allErrors.push(...dashErrors);

    // Salvar erros
    ensureDir(EVIDENCE_DIR);
    fs.writeFileSync(path.join(EVIDENCE_DIR, 'console-errors.json'), JSON.stringify(allErrors, null, 2));

    // Veredicto final
    console.log('\n========================================');
    console.log(`VEREDICTO: Todas as correcoes funcionam em producao? ${verdict ? 'Sim' : 'Nao'}`);
    console.log('========================================');

  } catch (e) {
    console.error('Erro durante execucao:', e.message);
    await safeScreenshot(page, '99-error');
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
