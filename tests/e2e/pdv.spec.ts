import { test, expect } from "./fixtures";

test.describe("Ponto de Venda (PDV)", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("./pdv");
    await page.waitForLoadState("domcontentloaded");
  });

  test("deve exibir página de PDV", async ({ page }) => {
    // Verificar que o título da página está visível
    await expect(
      page.getByRole("heading", { name: /ponto de venda/i }),
    ).toBeVisible();

    // Verificar que o status do caixa está visível (aberto ou fechado)
    await expect(
      page.getByText(/caixa fechado|caixa aberto/i),
    ).toBeVisible();

    // Verificar seção de adicionar item
    await expect(page.getByText(/adicionar item/i)).toBeVisible();

    // Verificar seção de pagamento
    await expect(page.getByText(/pagamento/i)).toBeVisible();
  });

  test("deve navegar para PDV", async ({ page }) => {
    // Navegar diretamente para a rota
    await page.goto("./pdv");
    await page.waitForLoadState("domcontentloaded");

    // Verificar URL
    await expect(page).toHaveURL(/.*\/pdv/);

    // Verificar que a página carregou com elementos principais
    await expect(
      page.getByRole("heading", { name: /ponto de venda/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /abrir caixa|fechar caixa/i }),
    ).toBeVisible();
  });
});
