import { test, expect } from "./fixtures";

test.describe("Financial Module", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await page.goto("/financeiro");
  });

  test("should display financial dashboard", async ({ page }) => {
    await expect(page.getByText(/gestão financeira/i)).toBeVisible();
    await expect(page.getByText(/receitas/i)).toBeVisible();
    await expect(page.getByText(/despesas/i)).toBeVisible();
  });
});
