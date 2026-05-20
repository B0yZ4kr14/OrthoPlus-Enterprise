import { test, expect } from "./fixtures";

test.describe("TISS — Faturamento de Convênios", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("./faturamento-tiss");
    await page.waitForLoadState("domcontentloaded");
  });

  test("deve exibir página de TISS", async ({ page }) => {
    // Verificar que o título da página está visível
    await expect(
      page.getByRole("heading", { name: "TISS", exact: true }),
    ).toBeVisible();

    // Verificar descrição
    await expect(
      page.getByText(/troca de informações em saúde suplementar/i),
    ).toBeVisible();

    // Verificar tabs principais
    await expect(page.getByRole("tab", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /guias/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /lotes/i })).toBeVisible();

    // Verificar botão de nova guia
    await expect(
      page.getByRole("button", { name: /nova guia/i }),
    ).toBeVisible();
  });

  test("deve navegar para TISS", async ({ page }) => {
    // Navegar diretamente para a rota
    await page.goto("./faturamento-tiss");
    await page.waitForLoadState("domcontentloaded");

    // Verificar URL
    await expect(page).toHaveURL(/.*\/faturamento-tiss/);

    // Verificar que o conteúdo principal carregou
    await expect(
      page.getByRole("heading", { name: "TISS", exact: true }),
    ).toBeVisible();
  });
});
