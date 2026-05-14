const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = '/home/b0yz4kr14/Projects/OrthoPlus-Enterprise/tests/evidence';
const BASE_URL_LOWER = 'https://tsiapp.io/orthoplus-enterprise';
const BASE_URL_UPPER = 'https://tsiapp.io/OrthoPlus-Enterprise/';

const LOGIN_EMAIL = process.env.QA_EMAIL;
const LOGIN_PASS = process.env.QA_PASS;

function log(label, data) {
  const line = `[${new Date().toISOString()}] ${label}: ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`;
  console.log(line);
  fs.appendFileSync(path.join(EVIDENCE_DIR, 'investigation.log'), line + '\n');
}

async function investigate() {
  fs.writeFileSync(path.join(EVIDENCE_DIR, 'investigation.log'), `=== INVESTIGACAO QA - ${new Date().toISOString()} ===\n\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  log('LOOP 1', 'Iniciando acesso ao site');

  const page1 = await context.newPage();
  let consoleErrors1 = [];
  page1.on('console', msg => {
    if (msg.type() === 'error') consoleErrors1.push({ type: msg.type(), text: msg.text() });
  });
  page1.on('pageerror', err => consoleErrors1.push({ type: 'pageerror', text: err.message }));

  let status1 = null;
  try {
    const resp1 = await page1.goto(BASE_URL_LOWER, { waitUntil: 'networkidle', timeout: 15000 });
    status1 = resp1 ? resp1.status() : 'no-response';
  } catch (e) {
    status1 = `error: ${e.message}`;
  }
  await page1.screenshot({ path: path.join(EVIDENCE_DIR, '01_url_lowercase.png'), fullPage: true });
  log('01_URL_LOWERCASE_STATUS', status1);
  log('01_URL_LOWERCASE_CONSOLE_ERRORS', consoleErrors1);
  await page1.close();

  const page2 = await context.newPage();
  let consoleErrors2 = [];
  page2.on('console', msg => {
    if (msg.type() === 'error') consoleErrors2.push({ type: msg.type(), text: msg.text() });
  });
  page2.on('pageerror', err => consoleErrors2.push({ type: 'pageerror', text: err.message }));

  let status2 = null;
  try {
    const resp2 = await page2.goto(BASE_URL_UPPER, { waitUntil: 'networkidle', timeout: 30000 });
    status2 = resp2 ? resp2.status() : 'no-response';
  } catch (e) {
    status2 = `error: ${e.message}`;
  }
  await page2.waitForTimeout(3000);
  await page2.screenshot({ path: path.join(EVIDENCE_DIR, '02_url_uppercase_homepage.png'), fullPage: true });
  log('02_URL_UPPERCASE_STATUS', status2);
  log('02_URL_UPPERCASE_CONSOLE_ERRORS', consoleErrors2);

  const sidebar = await page2.$('[data-sidebar]');
  const sidebarNav = await page2.$('nav[aria-label="Sidebar"]');
  const sidebarByRole = await page2.$('[role="navigation"]');
  const bodyStyles = await page2.evaluate(() => {
    const body = document.body;
    const styles = getComputedStyle(body);
    return {
      backgroundColor: styles.backgroundColor,
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      bodyHTML: document.body.innerHTML.substring(0, 2000),
    };
  });
  log('SIDEBAR_DATA_SIDEBAR', sidebar ? 'ENCONTRADO' : 'NAO ENCONTRADO');
  log('SIDEBAR_NAV_ARIA', sidebarNav ? 'ENCONTRADO' : 'NAO ENCONTRADO');
  log('SIDEBAR_ROLE_NAV', sidebarByRole ? 'ENCONTRADO' : 'NAO ENCONTRADO');
  log('BODY_STYLES', bodyStyles);

  const allNavs = await page2.$$('nav');
  const navDetails = [];
  for (let i = 0; i < allNavs.length; i++) {
    const html = await allNavs[i].evaluate(el => el.outerHTML.substring(0, 500));
    const aria = await allNavs[i].getAttribute('aria-label');
    navDetails.push({ index: i, ariaLabel: aria, htmlSnippet: html });
  }
  log('ALL_NAVS_COUNT', allNavs.length);
  log('ALL_NAVS_DETAILS', navDetails);

  const glassElements = await page2.evaluate(() => {
    const all = document.querySelectorAll('*');
    const results = [];
    for (const el of all) {
      const s = getComputedStyle(el);
      if (s.backdropFilter && s.backdropFilter !== 'none') {
        results.push({ tag: el.tagName, class: el.className, backdropFilter: s.backdropFilter, background: s.background });
      }
    }
    return results;
  });
  log('GLASSMORPHISM_ELEMENTS', glassElements.length > 0 ? glassElements : 'NENHUM ENCONTRADO');

  const htmlClass = await page2.evaluate(() => document.documentElement.className);
  const themeMeta = await page2.evaluate(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    return meta ? meta.getAttribute('content') : null;
  });
  log('HTML_CLASS', htmlClass);
  log('THEME_META', themeMeta);

  const loginHref = await page2.evaluate(() => {
    const a = document.querySelector('a[href*="auth"]');
    return a ? a.getAttribute('href') : null;
  });
  log('LOGIN_HREF', loginHref);

  await page2.screenshot({ path: path.join(EVIDENCE_DIR, '03_homepage_dom_check.png'), fullPage: true });
  await page2.close();

  log('LOOP 2', 'Iniciando teste de login');
  const page3 = await context.newPage();
  let consoleErrors3 = [];
  page3.on('console', msg => {
    if (msg.type() === 'error') consoleErrors3.push({ type: msg.type(), text: msg.text() });
  });
  page3.on('pageerror', err => consoleErrors3.push({ type: 'pageerror', text: err.message }));

  const loginUrl = loginHref ? (loginHref.startsWith('http') ? loginHref : `https://tsiapp.io${loginHref}`) : `${BASE_URL_UPPER}auth`;
  log('LOGIN_URL_USED', loginUrl);

  let loginStatus = null;
  try {
    const resp3 = await page3.goto(loginUrl, { waitUntil: 'networkidle', timeout: 30000 });
    loginStatus = resp3 ? resp3.status() : 'no-response';
  } catch (e) {
    loginStatus = `error: ${e.message}`;
  }
  await page3.waitForTimeout(2000);
  await page3.screenshot({ path: path.join(EVIDENCE_DIR, '04_login_page.png'), fullPage: true });
  log('LOGIN_PAGE_STATUS', loginStatus);
  log('LOGIN_PAGE_CONSOLE_ERRORS', consoleErrors3);

  const emailInput = await page3.$('input[name="email"], input[type="email"]');
  const passwordInput = await page3.$('input[name="password"], input[type="password"]');
  const submitBtn = await page3.$('button[type="submit"]');

  log('LOGIN_EMAIL_INPUT', emailInput ? 'ENCONTRADO' : 'NAO ENCONTRADO');
  log('LOGIN_PASSWORD_INPUT', passwordInput ? 'ENCONTRADO' : 'NAO ENCONTRADO');
  log('LOGIN_SUBMIT_BTN', submitBtn ? 'ENCONTRADO' : 'NAO ENCONTRADO');

  let menuTexts = [];
  let sidebarPost = null;
  let sidebarNavPost = null;
  let currentUrl = null;

  if (emailInput && passwordInput && submitBtn) {
    await emailInput.fill(LOGIN_EMAIL);
    await passwordInput.fill(LOGIN_PASS);
    await page3.screenshot({ path: path.join(EVIDENCE_DIR, '05_login_filled.png'), fullPage: true });

    await page3.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
      inputs.forEach(i => i.style.color = 'transparent');
    });

    await submitBtn.click();
    await page3.waitForTimeout(5000);
    await page3.screenshot({ path: path.join(EVIDENCE_DIR, '06_post_login.png'), fullPage: true });

    currentUrl = page3.url();
    log('POST_LOGIN_URL', currentUrl);

    sidebarPost = await page3.$('[data-sidebar]');
    sidebarNavPost = await page3.$('nav[aria-label="Sidebar"]');
    const menuItems = await page3.$$('nav a, nav button, [role="menuitem"]');
    for (const item of menuItems.slice(0, 10)) {
      const text = await item.textContent();
      if (text && text.trim()) menuTexts.push(text.trim().substring(0, 50));
    }
    log('POST_LOGIN_SIDEBAR_DATA', sidebarPost ? 'ENCONTRADO' : 'NAO ENCONTRADO');
    log('POST_LOGIN_SIDEBAR_NAV', sidebarNavPost ? 'ENCONTRADO' : 'NAO ENCONTRADO');
    log('POST_LOGIN_MENU_ITEMS', menuTexts);
  } else {
    log('LOGIN', 'Nao foi possivel preencher login — elementos nao encontrados');
  }

  const themeToggle = await page3.$('[data-testid="theme-toggle"], button[aria-label*="theme" i], button[aria-label*="tema" i]');
  log('THEME_TOGGLE', themeToggle ? 'ENCONTRADO' : 'NAO ENCONTRADO');
  let htmlClassAfter = null;
  if (themeToggle) {
    await themeToggle.click();
    await page3.waitForTimeout(1000);
    await page3.screenshot({ path: path.join(EVIDENCE_DIR, '07_theme_toggled.png'), fullPage: true });
    htmlClassAfter = await page3.evaluate(() => document.documentElement.className);
    log('THEME_AFTER_TOGGLE', htmlClassAfter);
  }

  await page3.close();

  log('LOOP 3', 'Iniciando teste mobile');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const page4 = await mobileContext.newPage();
  let consoleErrors4 = [];
  page4.on('console', msg => {
    if (msg.type() === 'error') consoleErrors4.push({ type: msg.type(), text: msg.text() });
  });
  page4.on('pageerror', err => consoleErrors4.push({ type: 'pageerror', text: err.message }));

  try {
    await page4.goto(BASE_URL_UPPER, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    log('MOBILE_GOTO_ERROR', e.message);
  }
  await page4.waitForTimeout(3000);
  await page4.screenshot({ path: path.join(EVIDENCE_DIR, '08_mobile_homepage.png'), fullPage: true });
  log('MOBILE_CONSOLE_ERRORS', consoleErrors4);

  const hamburger = await page4.$('button[aria-label*="menu" i], button[aria-label*="Menu" i], [data-testid="menu-toggle"], .hamburger, [class*="hamburger"]');
  log('MOBILE_HAMBURGER', hamburger ? 'ENCONTRADO' : 'NAO ENCONTRADO');

  const sidebarMobile = await page4.$('[data-sidebar]');
  log('MOBILE_SIDEBAR', sidebarMobile ? 'ENCONTRADO' : 'NAO ENCONTRADO');

  await page4.close();
  await mobileContext.close();

  const summary = {
    timestamp: new Date().toISOString(),
    urlLowercase: { status: status1, consoleErrors: consoleErrors1.length },
    urlUppercase: { status: status2, consoleErrors: consoleErrors2.length },
    sidebar: {
      homepage: { dataSidebar: !!sidebar, ariaNav: !!sidebarNav, roleNav: !!sidebarByRole },
      postLogin: { dataSidebar: sidebarPost ? true : false, ariaNav: sidebarNavPost ? true : false },
    },
    login: {
      url: loginUrl,
      pageStatus: loginStatus,
      elementsFound: { email: !!emailInput, password: !!passwordInput, submit: !!submitBtn },
      menuItemsCount: menuTexts.length,
    },
    theme: {
      toggleFound: !!themeToggle,
      htmlClass: htmlClass,
      htmlClassAfter: htmlClassAfter,
    },
    mobile: {
      hamburgerFound: !!hamburger,
      sidebarFound: !!sidebarMobile,
      consoleErrors: consoleErrors4.length,
    },
    glassmorphism: {
      elementsFound: glassElements.length,
    },
  };

  fs.writeFileSync(path.join(EVIDENCE_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  log('RESUMO', summary);

  await browser.close();
  console.log('\n=== INVESTIGACAO CONCLUIDA ===');
  console.log('Evidencias salvas em:', EVIDENCE_DIR);
}

investigate().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
