const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://tsiapp.io/OrthoPlus-Enterprise';
const OUT_DIR = '/home/b0yz4kr14/Projects/OrthoPlus-Enterprise/evidence/qa/playwright-exploration';

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

const ROUTES = [
  '/',
  '/login',
  '/auth',
  '/dashboard',
  '/pacientes',
  '/agenda',
  '/financeiro',
  '/orcamentos',
  '/procedimentos',
  '/dentistas',
  '/funcionarios',
  '/estoque',
  '/settings',
  '/configuracoes',
  '/admin',
  '/portal-paciente',
  '/odontograma',
  '/tratamentos',
  '/pep',
  '/pdv',
  '/crm',
  '/fidelidade',
  '/teleodonto',
  '/tiss',
  '/ia-radiografia',
  '/inadimplencia',
  '/cobranca',
  '/split-pagamento',
  '/crypto-payment',
  '/marketing-auto',
  '/recall',
  '/bi',
  '/contratos',
  '/landpage',
];

const API_ENDPOINTS = [
  '/api/health',
  '/api/memory-hub/health',
  '/api/agents/health',
];

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function takeScreenshot(page, name) {
  const filePath = path.join(OUT_DIR, 'screenshots', `${name}.png`);
  await ensureDir(path.dirname(filePath));
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function capturePageData(page, route, viewportName) {
  const data = {
    route,
    viewport: viewportName,
    url: page.url(),
    title: await page.title().catch(() => ''),
    status: null,
    consoleErrors: [],
    elements: {
      navMenus: [],
      cards: [],
      forms: [],
      buttons: [],
      links: [],
      images: [],
      headings: [],
    },
    apiResponses: [],
    screenshot: null,
  };

  // Capture console errors
  page.on('pageerror', (err) => {
    data.consoleErrors.push({ type: 'pageerror', message: err.message, stack: err.stack });
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      data.consoleErrors.push({ type: 'console', text: msg.text(), location: msg.location() });
    }
  });

  // Try to get HTTP status from response
  try {
    const resp = await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const mainResp = await page.evaluate(() => {
      return { status: performance.getEntriesByType('navigation')[0]?.responseStatus };
    }).catch(() => ({ status: null }));
    data.status = mainResp.status || 'unknown';
  } catch {}

  // Extract UI elements
  try {
    data.elements.navMenus = await page.$$eval('nav, [role="navigation"], header nav, .sidebar, aside', (els) =>
      els.map((el) => ({
        tag: el.tagName,
        class: el.className,
        text: el.innerText?.substring(0, 500),
        links: Array.from(el.querySelectorAll('a, button')).map((a) => ({
          text: a.innerText?.trim(),
          href: a.getAttribute('href'),
          class: a.className,
        })),
      }))
    );
  } catch {}

  try {
    data.elements.cards = await page.$$eval('[class*="card"], .card, [class*="Card"], [class*="panel"], [class*="Panel"]', (els) =>
      els.map((el) => ({
        tag: el.tagName,
        class: el.className,
        text: el.innerText?.substring(0, 300),
      }))
    );
  } catch {}

  try {
    data.elements.forms = await page.$$eval('form', (els) =>
      els.map((el) => ({
        action: el.getAttribute('action'),
        method: el.getAttribute('method'),
        fields: Array.from(el.querySelectorAll('input, select, textarea')).map((f) => ({
          tag: f.tagName,
          type: f.getAttribute('type'),
          name: f.getAttribute('name'),
          id: f.id,
          placeholder: f.getAttribute('placeholder'),
          label: f.labels?.[0]?.innerText || el.querySelector(`label[for="${f.id}"]`)?.innerText,
          required: f.required,
        })),
        buttons: Array.from(el.querySelectorAll('button[type="submit"], input[type="submit"]')).map((b) => ({
          text: b.innerText || b.value,
          class: b.className,
        })),
      }))
    );
  } catch {}

  try {
    data.elements.buttons = await page.$$eval('button, [role="button"], input[type="button"], input[type="submit"]', (els) =>
      els.map((el) => ({
        text: el.innerText?.trim() || el.value,
        class: el.className,
        type: el.getAttribute('type'),
        disabled: el.disabled,
      }))
    );
  } catch {}

  try {
    data.elements.links = await page.$$eval('a[href]', (els) =>
      els.map((el) => ({
        text: el.innerText?.trim(),
        href: el.getAttribute('href'),
        class: el.className,
      }))
    );
  } catch {}

  try {
    data.elements.images = await page.$$eval('img', (els) =>
      els.map((el) => ({
        src: el.getAttribute('src'),
        alt: el.getAttribute('alt'),
        width: el.width,
        height: el.height,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
      }))
    );
  } catch {}

  try {
    data.elements.headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (els) =>
      els.map((el) => ({
        level: el.tagName,
        text: el.innerText?.trim(),
      }))
    );
  } catch {}

  // Check for loading states and errors
  try {
    data.loadingState = await page.$eval('[class*="loading"], [class*="spinner"], [class*="skeleton"], .loading, .spinner', (el) => ({
      class: el.className,
      text: el.innerText,
    })).catch(() => null);
  } catch {}

  try {
    data.errorMessage = await page.$eval('[class*="error"], [class*="Error"], .error-message, .alert-danger', (el) => ({
      class: el.className,
      text: el.innerText,
    })).catch(() => null);
  } catch {}

  // Screenshot
  const safeName = `${route.replace(/[^a-zA-Z0-9]/g, '_')}_${viewportName}`;
  data.screenshot = await takeScreenshot(page, safeName);

  return data;
}

async function testApiEndpoint(browser, endpoint) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  let result = { endpoint, url, status: null, body: null, error: null };
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    result.status = response?.status() || null;
    const contentType = response?.headers()['content-type'] || '';
    if (contentType.includes('application/json')) {
      result.body = await response.json().catch(() => null);
    } else {
      result.body = await page.content().catch(() => null);
      if (result.body && result.body.length > 2000) result.body = result.body.substring(0, 2000) + '... [truncated]';
    }
  } catch (err) {
    result.error = err.message;
  } finally {
    await context.close();
  }
  return result;
}

async function exploreRoute(browser, route, viewportName) {
  const context = await browser.newContext({ viewport: VIEWPORTS[viewportName] });
  const page = await context.newPage();
  const url = `${BASE_URL}${route}`;
  let data = null;
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(async (err) => {
      // fallback to domcontentloaded
      return await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
    });
    await page.waitForTimeout(3000); // let JS apps settle
    data = await capturePageData(page, route, viewportName);
    if (response) data.status = response.status();
  } catch (err) {
    data = {
      route,
      viewport: viewportName,
      url,
      error: err.message,
      consoleErrors: [],
      elements: {},
      screenshot: null,
    };
    try {
      const safeName = `${route.replace(/[^a-zA-Z0-9]/g, '_')}_${viewportName}_error`;
      data.screenshot = await takeScreenshot(page, safeName);
    } catch {}
  } finally {
    await context.close();
  }
  return data;
}

function generateReport(results) {
  let md = `# OrthoPlus Enterprise — Playwright Navigation & Validation Report\n\n`;
  md += `**Date:** ${new Date().toISOString()}\n\n`;
  md += `**Base URL:** ${BASE_URL}\n\n`;
  md += `**Tester:** Automated Playwright Script\n\n`;
  md += `---\n\n`;

  // VPS Navigation Map
  md += `## 1. VPS Navigation Map\n\n`;
  md += `| Route | Status | Viewport | Title | Error |\n`;
  md += `|-------|--------|----------|-------|-------|\n`;
  for (const r of results.routeResults) {
    md += `| ${r.route} | ${r.status || 'N/A'} | ${r.viewport} | ${r.title || ''} | ${r.error ? 'YES' : ''} |\n`;
  }
  md += `\n`;

  // API Endpoints
  md += `## 2. API Endpoint Responses\n\n`;
  for (const api of results.apiResults) {
    md += `### ${api.endpoint}\n\n`;
    md += `- **URL:** ${api.url}\n`;
    md += `- **Status:** ${api.status ?? 'N/A'}\n`;
    if (api.error) md += `- **Error:** ${api.error}\n`;
    if (api.body) md += `- **Body Preview:** \n\n\`\`\`json\n${JSON.stringify(api.body, null, 2)}\n\`\`\`\n`;
    md += `\n`;
  }

  // Screenshot Inventory
  md += `## 3. Screenshot Inventory\n\n`;
  for (const r of results.routeResults) {
    if (r.screenshot) {
      const rel = path.relative(OUT_DIR, r.screenshot);
      md += `### ${r.route} (${r.viewport})\n\n`;
      md += `- **File:** \`${rel}\`\n`;
      md += `- **Status:** ${r.status ?? 'N/A'}\n`;
      md += `- **Title:** ${r.title || 'N/A'}\n`;
      md += `- **URL:** ${r.url}\n`;
      if (r.error) md += `- **Navigation Error:** ${r.error}\n`;
      md += `\n`;
    }
  }

  // UI Element Inventory per unique route
  md += `## 4. UI Element Inventory\n\n`;
  const byRoute = {};
  for (const r of results.routeResults) {
    if (!byRoute[r.route]) byRoute[r.route] = r;
  }
  for (const [route, r] of Object.entries(byRoute)) {
    md += `### ${route}\n\n`;
    if (r.elements?.navMenus?.length) {
      md += `#### Navigation Menus\n\n`;
      for (const nav of r.elements.navMenus) {
        md += `- **${nav.tag}** \`${nav.class?.substring(0, 80)}\`\n`;
        if (nav.links?.length) {
          for (const l of nav.links.slice(0, 20)) {
            md += `  - ${l.text || '[no text]'} → ${l.href || '[no href]'}\n`;
          }
          if (nav.links.length > 20) md += `  - ... and ${nav.links.length - 20} more\n`;
        }
      }
      md += `\n`;
    }
    if (r.elements?.cards?.length) {
      md += `#### Cards / Components\n\n`;
      for (const c of r.elements.cards.slice(0, 10)) {
        md += `- \`${c.class?.substring(0, 80)}\`: ${c.text?.substring(0, 120) || '[empty]'}\n`;
      }
      if (r.elements.cards.length > 10) md += `- ... and ${r.elements.cards.length - 10} more\n`;
      md += `\n`;
    }
    if (r.elements?.forms?.length) {
      md += `#### Forms\n\n`;
      for (const f of r.elements.forms) {
        md += `- Form (action=${f.action || 'N/A'})\n`;
        for (const fld of f.fields) {
          md += `  - ${fld.tag}${fld.type ? `[${fld.type}]` : ''} name=${fld.name || 'N/A'} placeholder=${fld.placeholder || 'N/A'} label=${fld.label || 'N/A'} required=${fld.required}\n`;
        }
        for (const b of f.buttons) {
          md += `  - Submit: ${b.text || 'N/A'}\n`;
        }
      }
      md += `\n`;
    }
    if (r.elements?.buttons?.length) {
      md += `#### Buttons\n\n`;
      for (const b of r.elements.buttons.slice(0, 15)) {
        md += `- ${b.text || '[no text]'} (${b.type || 'button'})${b.disabled ? ' [disabled]' : ''}\n`;
      }
      if (r.elements.buttons.length > 15) md += `- ... and ${r.elements.buttons.length - 15} more\n`;
      md += `\n`;
    }
    if (r.elements?.headings?.length) {
      md += `#### Headings\n\n`;
      for (const h of r.elements.headings.slice(0, 15)) {
        md += `- ${h.level}: ${h.text}\n`;
      }
      md += `\n`;
    }
    if (r.elements?.images?.length) {
      md += `#### Images\n\n`;
      for (const img of r.elements.images.slice(0, 10)) {
        md += `- src=${img.src?.substring(0, 100) || 'N/A'} alt=${img.alt || 'N/A'} ${img.naturalWidth}x${img.naturalHeight}\n`;
      }
      if (r.elements.images.length > 10) md += `- ... and ${r.elements.images.length - 10} more\n`;
      md += `\n`;
    }
    if (r.loadingState) {
      md += `#### Loading State\n\n- \`${r.loadingState.class}\`: ${r.loadingState.text || ''}\n\n`;
    }
    if (r.errorMessage) {
      md += `#### Error Message\n\n- \`${r.errorMessage.class}\`: ${r.errorMessage.text || ''}\n\n`;
    }
  }

  // Console Errors
  md += `## 5. Console Error Log\n\n`;
  let hasErrors = false;
  for (const r of results.routeResults) {
    if (r.consoleErrors?.length) {
      hasErrors = true;
      md += `### ${r.route} (${r.viewport})\n\n`;
      for (const err of r.consoleErrors) {
        md += `- \`${err.type}\`: ${err.message || err.text}\n`;
      }
      md += `\n`;
    }
  }
  if (!hasErrors) md += `No console errors detected.\n\n`;

  // Broken images/links
  md += `## 6. Broken Images / Links Observations\n\n`;
  for (const r of results.routeResults) {
    if (r.elements?.images) {
      const broken = r.elements.images.filter((i) => i.naturalWidth === 0 && i.naturalHeight === 0 && i.src);
      if (broken.length) {
        md += `### ${r.route}\n`;
        for (const b of broken) md += `- Broken image: ${b.src?.substring(0, 120)}\n`;
        md += `\n`;
      }
    }
  }
  md += `\n`;

  // Accessibility observations
  md += `## 7. Accessibility Observations\n\n`;
  for (const r of results.routeResults) {
    if (!r.elements) continue;
    const imgsWithoutAlt = (r.elements.images || []).filter((i) => !i.alt && i.src);
    const formsWithoutLabels = (r.elements.forms || []).flatMap((f) => f.fields.filter((fld) => !fld.label && !fld.placeholder));
    if (imgsWithoutAlt.length || formsWithoutLabels.length) {
      md += `### ${r.route}\n\n`;
      if (imgsWithoutAlt.length) {
        md += `- Images without alt text: ${imgsWithoutAlt.length}\n`;
      }
      if (formsWithoutLabels.length) {
        md += `- Form fields without labels/placeholders: ${formsWithoutLabels.length}\n`;
      }
      md += `\n`;
    }
  }

  // Comparison notes
  md += `## 8. Comparison Notes: Codebase vs Deployed\n\n`;
  md += `Based on the AGENTS.md project documentation, the following modules are expected to exist:\n\n`;
  md += `### Expected Frontend Routes (from AGENTS.md)\n\n`;
  const expectedRoutes = [
    '/admin', '/configuracoes', '/crypto-payment', '/financeiro', '/marketing-auto', '/recall',
    '/inadimplencia', '/estoque', '/inventario/dashboard', '/split-pagamento',
    '/agenda', '/auth', '/bi', '/contratos', '/crm', '/dashboard', '/fidelidade', '/files',
    '/funcionarios', '/lgpd', '/orcamentos', '/pacientes', '/pdv', '/pep', '/procedimentos',
    '/teleodonto', '/tiss', '/landpage', '/portal-paciente', '/odontograma', '/tratamentos',
    '/ia-radiografia', '/cobranca', '/settings'
  ];
  for (const er of expectedRoutes) {
    const found = results.routeResults.find((r) => r.route === er && !r.error);
    md += `- \`${er}\` → ${found ? `Responded (status ${found.status ?? '?'})` : 'Not tested or error'}\n`;
  }
  md += `\n`;

  md += `### Expected API Endpoints\n\n`;
  md += `- \`/api/health\` → ${results.apiResults.find(a => a.endpoint === '/api/health')?.status ?? 'N/A'}\n`;
  md += `- \`/api/memory-hub/health\` → ${results.apiResults.find(a => a.endpoint === '/api/memory-hub/health')?.status ?? 'N/A'}\n`;
  md += `- \`/api/agents/health\` → ${results.apiResults.find(a => a.endpoint === '/api/agents/health')?.status ?? 'N/A'}\n`;
  md += `\n`;

  // Summary
  md += `## 9. Summary\n\n`;
  const totalRoutes = results.routeResults.length;
  const okRoutes = results.routeResults.filter((r) => r.status && r.status < 400 && !r.error).length;
  const errorRoutes = results.routeResults.filter((r) => r.error || (r.status && r.status >= 400)).length;
  md += `- **Total route tests:** ${totalRoutes}\n`;
  md += `- **Successful responses (<400):** ${okRoutes}\n`;
  md += `- **Errors / 4xx / 5xx:** ${errorRoutes}\n`;
  md += `- **API endpoints tested:** ${results.apiResults.length}\n`;
  md += `- **Screenshots taken:** ${results.routeResults.filter((r) => r.screenshot).length}\n`;
  md += `\n`;

  fs.writeFileSync(path.join(OUT_DIR, 'report.md'), md, 'utf8');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const routeResults = [];
  const apiResults = [];

  // Test main page across viewports first
  for (const vp of ['desktop', 'tablet', 'mobile']) {
    const data = await exploreRoute(browser, '/', vp);
    routeResults.push(data);
  }

  // Test other routes on desktop
  for (const route of ROUTES.slice(1)) {
    const data = await exploreRoute(browser, route, 'desktop');
    routeResults.push(data);
  }

  // Test API endpoints
  for (const ep of API_ENDPOINTS) {
    const data = await testApiEndpoint(browser, ep);
    apiResults.push(data);
  }

  await browser.close();

  generateReport({ routeResults, apiResults });
  console.log('Done. Report written to', path.join(OUT_DIR, 'report.md'));
})();
