import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  
  console.log("Navigating to production...");
  await page.goto('https://100.111.74.69/');
  
  console.log("Waiting for email input...");
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  await page.fill('input[name="email"]', 'admin@orthoplus.com');
  
  console.log("Waiting for password input...");
  await page.fill('input[name="password"]', 'Admin123!');
  
  console.log("Clicking login...");
  await page.click('button[type="submit"]');
  
  console.log("Waiting for dashboard to load...");
  // Wait for some element that proves we are logged in, e.g., a card or header
  await page.waitForTimeout(5000); 
  
  const html = await page.content();
  if (html.includes('Ortho+') && !html.includes('seu@email.com')) {
    console.log("✅ SUCCESS: Successfully logged in and dashboard loaded!");
    
    // Check navigation context
    const tabsExist = await page.$$eval('[role="tab"], [role="tablist"], .tabs, nav', els => els.length > 0);
    console.log(tabsExist ? "✅ SUCCESS: Navigation tabs/menus are present." : "❌ WARNING: Navigation tabs not found.");

    await page.screenshot({ path: 'prod_dashboard_success.png', fullPage: true });
    console.log("Screenshot saved to prod_dashboard_success.png");
  } else {
    console.log("❌ FAILED: Did not reach the dashboard. Dumping html snapshot...");
    await page.screenshot({ path: 'prod_login_failed.png', fullPage: true });
  }

  await browser.close();
})();
