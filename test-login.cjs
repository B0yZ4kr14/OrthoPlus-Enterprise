const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  
  try {
    console.log("Navigating...");
    await page.goto('https://100.111.74.69', { waitUntil: 'networkidle', timeout: 15000 });
    console.log("Page loaded. Title:", await page.title());
    
    // Screenshot 1
    await page.screenshot({ path: 'login-page.png' });
    console.log("Saved login-page.png");
    
    // Assume login form
    await page.fill('input[type="email"]', 'admin@orthoplus.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    console.log("Submitted form, waiting for nav...");
    await page.waitForTimeout(5000); 
    
    // Screenshot 2
    await page.screenshot({ path: 'dashboard.png' });
    console.log("Saved dashboard.png");
    
    console.log("Current URL:", page.url());
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
})();
