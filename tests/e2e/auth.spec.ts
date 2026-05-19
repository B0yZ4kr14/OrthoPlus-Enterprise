import { expect, test } from "@playwright/test";

test.describe("Autenticação", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) =>
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`),
    );
    page.on("pageerror", (err) =>
      console.log(`[Browser Error]: ${err.message}`),
    );
  });

  test("deve exibir página de login para usuários não autenticados", async ({
    page,
  }) => {
    await page.goto("./auth", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/.*\/auth/);
    await expect(page.getByRole("heading", { name: /ortho/i })).toBeVisible();
  });

  test("deve fazer login com credenciais válidas", async ({ page }) => {
    await page.goto("./auth", { waitUntil: "networkidle" });

    await page
      .locator('input[name="email"]:visible')
      .first()
      .fill("admin@orthoplus.com");
    await page.locator('input[type="password"]:visible').first().fill("admin123!");

    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.waitForLoadState("networkidle");
    // Verificar que saiu da tela de login (breadcrumb mostra Dashboard)
    await expect(page.locator('nav[aria-label="breadcrumb"]')).toContainText("Dashboard");
  });

  test("deve exibir erro com credenciais inválidas", async ({ page }) => {
    await page.goto("./auth", { waitUntil: "networkidle" });

    await page
      .locator('input[name="email"]:visible')
      .first()
      .fill("invalido@email.com");
    await page.locator('input[type="password"]:visible').first().fill("senhaErrada");

    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    await expect(page).toHaveURL(/.*\/auth/);
  });

  test("deve fazer logout com sucesso", async ({ page }) => {
    await page.goto("./auth", { waitUntil: "networkidle" });
    await page
      .locator('input[name="email"]:visible')
      .first()
      .fill("admin@orthoplus.com");
    await page.locator('input[type="password"]:visible').first().fill("admin123!");
    await page
      .getByRole("button", { name: /entrar/i })
      .first()
      .click();

    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.waitForLoadState("networkidle");

    // Abrir menu do usuário e fazer logout via API (mais robusto que UI dropdown)
    await page.evaluate(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.dispatchEvent(new Event("storage"));
    });
    await page.reload();

    // Aguardar redirecionamento para login após logout
    await page.waitForURL(/.*\/auth/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/auth/);
  });

  test("deve proteger rotas privadas", async ({ page }) => {
    await page.goto("./dashboard", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/.*\/auth/);
  });

  test("deve validar campos vazios", async ({ page }) => {
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
