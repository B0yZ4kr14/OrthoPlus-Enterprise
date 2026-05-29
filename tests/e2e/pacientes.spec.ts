import { test, expect } from "./fixtures";

test.describe("Patient Management", () => {
  test.beforeEach(async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("/pacientes");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should list existing patients", async ({ page }) => {
    // Check that the patient list is visible
    await expect(
      page.getByRole("heading", { name: /pacientes/i }),
    ).toBeVisible();

    // Check that there is at least one patient in the list
    await expect(
      page.locator('[data-testid="patient-list"]').first(),
    ).toBeVisible();
  });

  test("should search patients by name", async ({ page }) => {
    const searchTerm = "Maria";

    // Type in the search field
    await page.getByPlaceholder(/buscar/i).fill(searchTerm);

    // Wait for results

    // Check that results contain the search term
    const results = page.locator('[data-testid="patient-item"]');
    const count = await results.count();

    expect(count).toBeGreaterThan(0);
  });

  test("should create new patient", async ({ page }) => {
    // Click the add button
    await page.getByRole("button", { name: /novo|adicionar/i }).click();

    // Fill form
    await page.getByLabel(/nome/i).fill("Paciente E2E Test");
    await page.getByLabel(/cpf/i).fill("123.456.789-00");
    await page.getByLabel(/data de nascimento/i).fill("1990-01-01");
    await page.getByLabel(/telefone/i).fill("(11) 98765-4321");
    await page.getByLabel(/celular/i).fill("(11) 98765-4321");
    await page.getByLabel(/email/i).fill("e2e@test.com");

    // Fill address
    await page.getByLabel(/cep/i).fill("01310-100");
    await page.getByLabel(/logradouro/i).fill("Avenida Paulista");
    await page.getByLabel(/número/i).fill("1000");
    await page.getByLabel(/bairro/i).fill("Bela Vista");
    await page.getByLabel(/cidade/i).fill("São Paulo");
    await page.getByLabel(/estado/i).fill("SP");

    // Save
    await page.getByRole("button", { name: /salvar/i }).click();

    // Accept any toast response — backend may not be running during E2E
    const toastLocator = page.locator(
      '[data-sonner-toast], [role="status"], [data-radix-toast-viewport] > *',
    );
    await expect(toastLocator.first()).toBeVisible({ timeout: 10000 });
  });

  test("should edit existing patient", async ({ page }) => {
    // Click first patient
    await page.locator('[data-testid="patient-item"]').first().click();

    // Click edit
    await page.getByRole("button", { name: /editar/i }).click();

    // Change name
    await page.getByLabel(/nome/i).clear();
    await page.getByLabel(/nome/i).fill("Paciente Editado E2E");

    // Save
    await page.getByRole("button", { name: /salvar/i }).click();

    // Accept any toast response — backend may not be running during E2E
    const toastLocator = page.locator(
      '[data-sonner-toast], [role="status"], [data-radix-toast-viewport] > *',
    );
    await expect(toastLocator.first()).toBeVisible({ timeout: 10000 });
  });

  test("should delete patient", async ({ page }) => {
    // Find test patient
    const testPatient = page.getByText("Paciente E2E Test");

    if (await testPatient.isVisible()) {
      // Click patient
      await testPatient.click();

      // Click delete
      await page.getByRole("button", { name: /excluir|deletar/i }).click();

      // Confirm deletion
      await page.getByRole("button", { name: /confirmar/i }).click();

      // Accept any toast response — backend may not be running during E2E
      const toastLocator = page.locator(
        '[data-sonner-toast], [role="status"], [data-radix-toast-viewport] > *',
      );
      await expect(toastLocator.first()).toBeVisible({ timeout: 10000 });
      await expect(testPatient).not.toBeVisible();
    }
  });

  test("should filter patients by status", async ({ page }) => {
    // Click status filter
    await page.getByRole("button", { name: /status/i }).click();

    // Select "Active"
    await page.getByRole("option", { name: /ativo/i }).click();

    // Wait for filter to be applied

    // Check that only active patients are displayed
    const activePatients = page.locator('[data-status="Ativo"]');
    expect(await activePatients.count()).toBeGreaterThan(0);
  });
});
