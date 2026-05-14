const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://tsiapp.io/OrthoPlus-Enterprise';
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASS;

const ROUTES = {
  clinica: [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/agenda', name: 'Agenda' },
    { path: '/pacientes', name: 'Pacientes' },
    { path: '/pacientes/novo', name: 'Novo Paciente' },
    { path: '/pep', name: 'Prontuario PEP' },
    { path: '/odontograma', name: 'Odontograma' },
    { path: '/tratamentos', name: 'Planos de Tratamento' },
    { path: '/procedimentos', name: 'Procedimentos' },
    { path: '/orcamentos', name: 'Orcamentos' },
    { path: '/contratos', name: 'Contratos Digitais' },
    { path: '/dentistas', name: 'Dentistas' },
    { path: '/funcionarios', name: 'Funcionarios' },
  ],
  financeiro: [
    { path: '/financeiro', name: 'Financeiro Dashboard' },
    { path: '/financeiro/receber', name: 'Contas a Receber' },
    { path: '/financeiro/fiscal/notas', name: 'Notas Fiscais' },
    { path: '/financeiro/conciliacao', name: 'Conciliacao' },
    { path: '/pdv', name: 'PDV' },
    { path: '/inadimplencia', name: 'Inadimplencia' },
    { path: '/split-pagamento', name: 'Split de Pagamentos' },
    { path: '/crypto-payment', name: 'Pagamentos Crypto' },
  ],
  admin: [
    { path: '/configuracoes', name: 'Configuracoes Gerais' },
    { path: '/configuracoes/modulos', name: 'Meus Modulos' },
    { path: '/configuracoes/database', name: 'Bancos por Categoria' },
    { path: '/usuarios', name: 'Usuarios' },
    { path: '/admin/database', name: 'Admin Database' },
    { path: '/admin/backups', name: 'Admin Backups' },
    { path: '/admin/crypto-config', name: 'Admin Crypto Config' },
    { path: '/admin/github', name: 'Admin GitHub' },
    { path: '/admin/terminal', name: 'Admin Terminal' },
    { path: '/admin/wiki', name: 'Admin Wiki' },
    { path: '/admin/monitoring', name: 'Admin Monitoramento' },
    { path: '/admin/logs', name: 'Admin Logs' },
    { path: '/admin/api-docs', name: 'Admin API Docs' },
    { path: '/admin/audit', name: 'Admin Audit Logs' },
  ],
  marketing: [
    { path: '/crm', name: 'CRM' },
    { path: '/marketing-auto', name: 'Marketing Automatico' },
    { path: '/fidelidade', name: 'Fidelidade' },
    { path: '/recall', name: 'Recall' },
    { path: '/portal-paciente', name: 'Portal do Paciente' },
    { path: '/bi', name: 'Business Intelligence' },
    { path: '/dashboards/comercial', name: 'Dashboard Comercial' },
    { path: '/teleodonto', name: 'Teleodonto' },
    { path: '/lgpd', name: 'LGPD' },
    { path: '/faturamento-tiss', name: 'TISS' },
    { path: '/ia-radiografia', name: 'IA Radiografia' },
  ],
  outros: [
    { path: '/', name: 'Landing Page' },
    { path: '/auth', name: 'Login' },
    { path: '/estoque', name: 'Estoque' },
    { path: '/estoque/inventario-historico', name: 'Inventario Historico' },
    { path: '/inventario/dashboard', name: 'Inventario Dashboard' },
    { path: '/assinatura-icp', name: 'Assinatura ICP' },
    { path: '/fluxo-digital', name: 'Fluxo Digital' },
  ],
};

async function validateCategory(category, outputDir) {
  const results = [];
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log(`[${category}] Logging in...`);
  await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle' });
  const emailInput = await page.locator('input[type="email"], input[placeholder*="email"], input[name="email"], input[type="text"]').first();
  await emailInput.fill(EMAIL);
  const pwdInput = await page.locator('input[type="password"]').first();
  await pwdInput.fill(PASSWORD);
  await page.click('button:has-text("Entrar"), button[type="submit"]');
  await page.waitForTimeout(5000);

  const routes = ROUTES[category] || [];

  for (const route of routes) {
    const fullUrl = `${BASE_URL}${route.path}`;
    try {
      await page.goto(fullUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      const url = page.url();
      const html = await page.content();
      const title = await page.title();

      const is403 = url.includes('/403');
      const isBlank = html.length < 5000 && !html.includes('id="root"');

      const screenshotPath = path.join(outputDir, `${category}-${route.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      const status = is403 ? '403_FORBIDDEN' : isBlank ? 'BLANK' : 'OK';
      results.push({ category, route: route.path, name: route.name, status, url, title, screenshot: screenshotPath });
      console.log(`[${category}] ${route.name}: ${status}`);
    } catch (err) {
      results.push({ category, route: route.path, name: route.name, status: 'ERROR', error: err.message });
      console.log(`[${category}] ${route.name}: ERROR - ${err.message}`);
    }
  }

  await browser.close();

  const jsonPath = path.join(outputDir, `${category}-results.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n[${category}] Results saved to ${jsonPath}`);
  return results;
}

const category = process.argv[2];
const outputDir = process.argv[3] || '/tmp/validation-results';

if (!EMAIL || !PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASS env vars');
  process.exit(1);
}

if (!category || !ROUTES[category]) {
  console.error('Usage: node validate-routes.cjs <category> <output-dir>');
  console.error('Categories: ' + Object.keys(ROUTES).join(', '));
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

validateCategory(category, outputDir).catch(console.error);
