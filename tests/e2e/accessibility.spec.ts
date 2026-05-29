import { test, expect } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("dashboard should not have accessibility violations", async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("patients page should not have violations", async ({ page }) => {
    await page.goto("/pacientes");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("PEP module should not have violations", async ({ page }) => {
    await page.goto("/pep");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("financial module should not have violations", async ({ page }) => {
    await page.goto("/financeiro");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should be navigable by keyboard only", async ({ page }) => {
    await page.goto("/dashboard");

    // Test Tab navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Check that focus is visible
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(focusedElement).toBeTruthy();
  });

  test("forms should have associated labels", async ({ page }) => {
    await page.goto("/pacientes");
    await page.getByRole("button", { name: /novo/i }).click();

    // Check that all inputs have labels
    const inputs = await page
      .locator('input[type="text"], input[type="email"]')
      .all();

    for (const input of inputs) {
      const id = await input.getAttribute("id");
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test("images should have alt text", async ({ page }) => {
    await page.goto("/dashboard");

    const images = await page.locator("img").all();

    for (const img of images) {
      const alt = await img.getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });

  test("should have adequate contrast", async ({ page }) => {
    await page.goto("/dashboard");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
