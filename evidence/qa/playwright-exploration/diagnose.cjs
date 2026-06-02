const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://tsiapp.io/OrthoPlus-Enterprise';
const OUT_DIR = '/home/b0yz4kr14/Projects/OrthoPlus-Enterprise/evidence/qa/playwright-exploration';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const logs = [];
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text(), location: msg.location() });
  });
  page.on('pageerror', err => {
    logs.push({ type: 'pageerror', text: err.message, stack: err.stack });
  });
  page.on('requestfailed', req => {
    logs.push({ type: 'requestfailed', url: req.url(), failureText: req.failure()?.errorText });
  });
  page.on('response', resp => {
    if (resp.status() >= 400) {
      logs.push({ type: 'badresponse', url: resp.url(), status: resp.status() });
    }
  });

  console.log('Navigating to', BASE_URL);
  const response = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
  console.log('Response status:', response?.status());
  console.log('Content-Type:', response?.headers()['content-type']);

  // Wait extra time for React to hydrate
  await page.waitForTimeout(5000);

  // Get page HTML
  const html = await page.content();
  fs.writeFileSync(path.join(OUT_DIR, 'page-html.html'), html);

  // Get body inner text
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text length:', bodyText.length);
  console.log('Body text preview:', bodyText.substring(0, 500));

  // Get body inner HTML
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  fs.writeFileSync(path.join(OUT_DIR, 'body-html.html'), bodyHTML);

  // Check for specific elements
  const hasRoot = await page.$eval('#root', el => el ? { tag: el.tagName, class: el.className, children: el.children.length } : null).catch(() => null);
  const hasApp = await page.$eval('#app', el => el ? { tag: el.tagName, class: el.className, children: el.children.length } : null).catch(() => null);
  const hasMain = await page.$eval('main', el => el ? { tag: el.tagName, class: el.className, children: el.children.length } : null).catch(() => null);

  console.log('#root:', hasRoot);
  console.log('#app:', hasApp);
  console.log('main:', hasMain);

  // Screenshot
  await page.screenshot({ path: path.join(OUT_DIR, 'screenshots', 'diagnose-fullpage.png'), fullPage: true });
  await page.screenshot({ path: path.join(OUT_DIR, 'screenshots', 'diagnose-viewport.png') });

  // Check computed background color of body and html
  const styles = await page.evaluate(() => {
    const b = getComputedStyle(document.body);
    const h = getComputedStyle(document.documentElement);
    return {
      bodyBg: b.backgroundColor,
      bodyDisplay: b.display,
      bodyVisibility: b.visibility,
      htmlBg: h.backgroundColor,
    };
  });
  console.log('Computed styles:', styles);

  // List all visible text elements
  const textElements = await page.$$eval('body *', els =>
    els.filter(el => el.innerText?.trim().length > 0).map(el => ({
      tag: el.tagName,
      class: el.className,
      text: el.innerText.trim().substring(0, 100),
      rect: el.getBoundingClientRect(),
    })).slice(0, 30)
  );
  console.log('Text elements:', JSON.stringify(textElements, null, 2));

  // Save logs
  fs.writeFileSync(path.join(OUT_DIR, 'diagnose-logs.json'), JSON.stringify(logs, null, 2));

  await browser.close();
}

main().catch(console.error);
