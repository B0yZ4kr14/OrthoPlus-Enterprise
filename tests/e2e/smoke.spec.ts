import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("frontend loads authenticated dashboard", async ({ page }) => {
    await page.goto("./dashboard");
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 30000 });
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
    await page.goto("./auth");
    await expect(page).toHaveURL(/.*\/auth/);
    await expect(page.getByRole("heading", { name: /ortho/i })).toBeVisible();
    await context.close();
  });
});
