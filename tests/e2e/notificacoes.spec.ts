import { test, expect } from "./fixtures";

test.describe("Notifications", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    // Notifications do not have a dedicated page; the dropdown is in the global header
    await page.goto("./dashboard");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display notifications dropdown", async ({ page }) => {
    // Check that the bell icon is visible in the header
    const bellButton = page.getByRole("button", { name: /notificações/i });
    await expect(bellButton.first()).toBeVisible();

    // Click the bell to open dropdown
    await bellButton.first().click();

    // Check that the notifications panel opened
    await expect(page.getByText(/nenhuma notificação|notificações/i).first()).toBeVisible();
  });

  test("should navigate to dashboard and access notifications", async ({ page }) => {
    // Navigate to the dashboard where the notifications dropdown is available
    await page.goto("./dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Check URL
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Check that the notifications button is present in the layout
    const bellButton = page.getByRole("button", { name: /notificações/i });
    await expect(bellButton.first()).toBeVisible();

    // Open dropdown and check option to mark all as read (if there are notifications)
    await bellButton.first().click();
    await expect(page.getByText(/notificações/i).first()).toBeVisible();
  });
});
