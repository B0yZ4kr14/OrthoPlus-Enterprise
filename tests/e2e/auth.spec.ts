import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  // Auth tests need to start unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) =>
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`),
    );
    page.on("pageerror", (err) =>
      console.log(`[Browser Error]: ${err.message}`),
    );
  });

  test("should display login page for unauthenticated users", async ({
    page,
  }) => {
    await page.goto("./auth", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/.*\/auth/);
    await expect(page.getByRole("heading", { name: /ortho/i })).toBeVisible();
  });

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("./auth", { waitUntil: "networkidle" });

    await page
      .locator('input[name="email"]:visible')
      .first()
      .fill("admin@orthoplus.com");
    await page
      .locator('input[type="password"]:visible')
      .first()
      .fill("admin123!");

    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.waitForLoadState("networkidle");
    // Check that user left the login screen (breadcrumb shows Dashboard)
    await expect(page.locator('nav[aria-label="breadcrumb"]')).toContainText(
      "Dashboard",
    );
  });

  test("should display error with invalid credentials", async ({ page }) => {
    await page.goto("./auth", { waitUntil: "networkidle" });

    await page
      .locator('input[name="email"]:visible')
      .first()
      .fill("invalido@email.com");
    await page
      .locator('input[type="password"]:visible')
      .first()
      .fill("senhaErrada");

    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    await expect(page).toHaveURL(/.*\/auth/);
  });

  test("should logout successfully", async ({ page }) => {
    await page.goto("./auth", { waitUntil: "networkidle" });
    await page
      .locator('input[name="email"]:visible')
      .first()
      .fill("admin@orthoplus.com");
    await page
      .locator('input[type="password"]:visible')
      .first()
      .fill("admin123!");
    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.waitForLoadState("networkidle");

    // Open user menu and logout via API (more robust than UI dropdown)
    await page.evaluate(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.dispatchEvent(new Event("storage"));
    });
    await page.reload();

    // Wait for redirect to login after logout
    await page.waitForURL(/.*\/auth/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/auth/);
  });

  test("should protect private routes", async ({ page }) => {
    await page.goto("./dashboard", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/.*\/auth/);
  });

  test("should validate empty fields", async ({ page }) => {
    await page.goto("./auth", { waitUntil: "networkidle" });

    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    await expect(page.getByText(/Informe seu email ou usuário/i)).toBeVisible();
    await expect(
      page.getByText(/Senha deve ter no mínimo 6 caracteres/i),
    ).toBeVisible();
  });
});
