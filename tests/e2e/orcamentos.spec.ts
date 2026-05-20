import { test, expect } from "./fixtures";

test.describe("Gestão de Orçamentos", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("./orcamentos");
    await page.waitForLoadState("domcontentloaded");
  });

  test("deve exibir página de orçamentos", async ({ page }) => {
    // Verificar que o título da página está visível
    await expect(
      page.getByRole("heading", { name: "Orçamentos", exact: true }),
    ).toBeVisible();

    // Verificar que as tabs de filtros estão presentes
    await expect(page.getByRole("tab", { name: /todos/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /rascunhos/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /pendentes/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /aprovados/i })).toBeVisible();

    // Verificar botão de novo orçamento
    await expect(
      page.getByRole("button", { name: /novo orçamento/i }),
    ).toBeVisible();
  });

  test("deve navegar para orçamentos", async ({ page }) => {
    // Navegar diretamente para a rota
    await page.goto("./orcamentos");
    await page.waitForLoadState("domcontentloaded");

    // Verificar URL
    await expect(page).toHaveURL(/.*\/orcamentos/);

    // Verificar que a página carregou com os cards de métricas
    await expect(page.getByText(/total de orçamentos/i)).toBeVisible();
    await expect(page.getByText(/pendentes/i)).toBeVisible();
    await expect(page.getByText(/aprovados/i)).toBeVisible();
  });
});
