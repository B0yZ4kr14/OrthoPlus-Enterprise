import { test, expect } from "./fixtures";

test.describe("Gestão de Procedimentos", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("./procedimentos");
    await page.waitForLoadState("domcontentloaded");
  });

  test("deve exibir página de procedimentos", async ({ page }) => {
    // Verificar que o título da página está visível
    await expect(
      page.getByRole("heading", { name: "Procedimentos", exact: true }),
    ).toBeVisible();

    // Verificar descrição da página
    await expect(
      page.getByText(/gerencie o catálogo de procedimentos/i),
    ).toBeVisible();

    // Verificar que a lista ou botão de adicionar está presente
    await expect(
      page.getByRole("button", { name: /novo procedimento/i }).first(),
    ).toBeVisible();
  });

  test("deve navegar para procedimentos", async ({ page }) => {
    // Navegar diretamente para a rota
    await page.goto("./procedimentos");
    await page.waitForLoadState("domcontentloaded");

    // Verificar URL
    await expect(page).toHaveURL(/.*\/procedimentos/);

    // Verificar que o conteúdo principal carregou
    await expect(
      page.getByRole("heading", { name: "Procedimentos", exact: true }),
    ).toBeVisible();
  });
});
