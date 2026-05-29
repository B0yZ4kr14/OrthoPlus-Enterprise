import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("frontend loads authenticated dashboard", async ({ page, context }) => {
    await page.goto("./dashboard");
    
    // Use page.content() instead of innerHTML
    const content = await page.content();
    console.log("[DEBUG] page.content() length:", content.length);
    console.log("[DEBUG] page.content() (first 1000 chars):", content.substring(0, 1000));
    
    // Also check specific element
    const rootHTML = await page.locator("#root").innerHTML({ timeout: 5000 }).catch((e) => `[error: ${e.message}]`);
    console.log("[DEBUG] #root innerHTML:", rootHTML.substring(0, 500));
    
    // Check network requests
    const requests = await page.evaluate(() => {
      return performance.getEntriesByType("resource").map((r: any) => r.name);
    });
    console.log("[DEBUG] Network requests:", requests.slice(0, 10));
    
    // Wait for React to mount
    await page.waitForTimeout(5000);
    
    const rootAfterWait = await page.locator("#root").innerHTML({ timeout: 5000 }).catch((e) => `[error: ${e.message}]`);
    console.log("[DEBUG] #root after 5s:", rootAfterWait.substring(0, 500));
    
    // Verify we stay on dashboard (not redirected to /auth)
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });
    
    // Verify dashboard content loaded
    await expect(
      page.locator("body"),
    ).toContainText(/Master Dashboard|Bom dia|Boa tarde|Boa noite/i, { timeout: 15000 });
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
