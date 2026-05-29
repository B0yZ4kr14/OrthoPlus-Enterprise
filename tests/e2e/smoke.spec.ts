import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("frontend loads authenticated dashboard", async ({ page, context }) => {
    // Capture console logs
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });
    page.on("pageerror", (err) => {
      consoleLogs.push(`[PAGE ERROR] ${err.message}`);
    });
    
    // Capture network errors
    page.on("requestfailed", (request) => {
      consoleLogs.push(`[NETWORK FAILED] ${request.method()} ${request.url()} — ${request.failure()?.errorText}`);
    });
    
    await page.goto("./dashboard");
    
    // Wait a bit for JS to execute and capture logs
    await page.waitForTimeout(3000);
    
    console.log("[DEBUG] Current URL:", page.url());
    console.log("[DEBUG] Console logs:", consoleLogs.slice(0, 20));
    
    // Check if body has content
    const bodyHTML = await page.locator("body").innerHTML({ timeout: 5000 }).catch(() => "[failed]");
    console.log("[DEBUG] Body HTML (first 1000 chars):", bodyHTML.substring(0, 1000));
    
    // Verify we stay on dashboard (not redirected to /auth)
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });
    
    // Verify dashboard content loaded (Master Dashboard heading or WelcomeBanner)
    await expect(
      page.locator("body"),
    ).toContainText(/Master Dashboard|Bom dia|Boa tarde|Boa noite|Vis.o anal.tica/i, { timeout: 15000 });
  });

  test("backend health endpoint responds", async ({ request }) => {
    const response = await request.get("http://localhost:3005/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe("ok");
  });

  test("auth page loads without storageState", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("http://localhost:8080/OrthoPlus-Enterprise/auth");
    await expect(page.getByRole("heading", { name: /ortho/i })).toBeVisible();
    await context.close();
  });
});
