import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("frontend loads authenticated dashboard", async ({ page, context }) => {
    // Debug: log all cookies
    const cookies = await context.cookies();
    console.log("[DEBUG] Cookies:", cookies.map(c => ({ name: c.name, domain: c.domain, path: c.path })));
    
    await page.goto("./dashboard");
    
    // Debug: log current URL
    console.log("[DEBUG] Current URL:", page.url());
    
    // Verify we stay on dashboard (not redirected to /auth)
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });
    
    // Debug: log page title and body text snippet
    const title = await page.title();
    const bodyText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "[failed to get body text]");
    console.log("[DEBUG] Title:", title);
    console.log("[DEBUG] Body text (first 500 chars):", bodyText.substring(0, 500));
    
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
