import { test, expect } from "./fixtures";

test.describe("Gestão de Funcionários", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("./funcionarios");
    await page.waitForLoadState("domcontentloaded");
  });

  test("deve exibir página de funcionários", async ({ page }) => {
    // Verificar que o título da página está visível
    await expect(
      page.getByRole("heading", { name: "Funcionários", exact: true }),
    ).toBeVisible();

    // Verificar descrição da página
    await expect(
      page.getByText(/gestão da equipe e colaboradores/i),
    ).toBeVisible();

    // Verificar botão de novo funcionário
    await expect(
      page.getByRole("button", { name: /novo funcionário/i }),
    ).toBeVisible();
  });

  test("deve navegar para funcionários", async ({ page }) => {
    // Navegar diretamente para a rota
    await page.goto("./funcionarios");
    await page.waitForLoadState("domcontentloaded");

    // Verificar URL
    await expect(page).toHaveURL(/.*\/funcionarios/);

    // Verificar que a lista de funcionários ou estado vazio carregou
    await expect(
      page.getByRole("heading", { name: "Funcionários", exact: true }),
    ).toBeVisible();
  });
});
