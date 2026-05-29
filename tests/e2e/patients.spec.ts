import { test, expect } from "./fixtures";

test.describe("Patient Management", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    await page.goto("/pacientes");
  });

  test("should display patient list", async ({ page }) => {
    await expect(page.getByText(/pacientes/i)).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("should open patient registration modal", async ({ page }) => {
    await page
      .getByRole("button", { name: /novo paciente|adicionar/i })
      .click();

    await expect(page.getByText(/cadastrar paciente/i)).toBeVisible();
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/cpf/i)).toBeVisible();
  });

  test("should validate required fields when registering", async ({ page }) => {
    await page
      .getByRole("button", { name: /novo paciente|adicionar/i })
      .click();
    await page.getByRole("button", { name: /salvar|cadastrar/i }).click();

    await expect(page.getByText(/campo.*obrigatório/i).first()).toBeVisible();
  });

  test("should filter patients by name", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|pesquisar/i);
    await searchInput.fill("João");

    await page.waitForTimeout(500); // Debounce

    const rows = page.getByRole("row");
    await expect(rows).not.toHaveCount(0);
  });

  test("should display patient details", async ({ page }) => {
    const firstPatient = page.getByRole("row").nth(1);
    await firstPatient.click();

    await expect(page.getByText(/detalhes|prontuário/i)).toBeVisible();
  });
});
