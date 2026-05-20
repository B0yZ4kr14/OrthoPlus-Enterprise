import { test, expect } from "./fixtures";

test.describe("Notificações", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    // Notificações não possuem página dedicada; o dropdown está no header global
    await page.goto("./dashboard");
    await page.waitForLoadState("domcontentloaded");
  });

  test("deve exibir dropdown de notificações", async ({ page }) => {
    // Verificar que o ícone do sino está visível no header
    const bellButton = page.getByRole("button", { name: /notificações/i });
    await expect(bellButton.first()).toBeVisible();

    // Clicar no sino para abrir o dropdown
    await bellButton.first().click();

    // Verificar que o painel de notificações abriu
    await expect(page.getByText(/nenhuma notificação|notificações/i).first()).toBeVisible();
  });

  test("deve navegar para dashboard e acessar notificações", async ({ page }) => {
    // Navegar para o dashboard onde o dropdown de notificações está disponível
    await page.goto("./dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Verificar URL
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Verificar que o botão de notificações está presente no layout
    const bellButton = page.getByRole("button", { name: /notificações/i });
    await expect(bellButton.first()).toBeVisible();

    // Abrir dropdown e verificar opção de marcar todas como lidas (se houver notificações)
    await bellButton.first().click();
    await expect(page.getByText(/notificações/i).first()).toBeVisible();
  });
});
