import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("frontend loads authenticated dashboard", async ({ page }) => {
    await page.goto("./dashboard");
    // Verify we stay on dashboard (not redirected to /auth)
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });
    // Verify dashboard content loaded (WelcomeBanner or PageHeader)
    await expect(
      page.locator("body"),
    ).toContainText(/Master Dashboard|Vis.o anal.tica|Bem-vindo/i, { timeout: 15000 });
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
