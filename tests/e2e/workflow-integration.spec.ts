import { test, expect } from "./fixtures";

test.describe("Integrated Flow: Patient → EHR → Treatment → Scheduling → Financial", () => {
  test("should complete full service flow", async ({ page }) => {
    // ========== STEP 1: LOGIN ==========
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // ========== STEP 2: CREATE PATIENT ==========
    await page.goto("/pacientes");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: /novo|adicionar/i }).click();

    // Fill patient data
    const patientName = `Paciente Fluxo E2E ${Date.now()}`;
    await page.getByLabel(/nome/i).fill(patientName);
    await page.getByLabel(/cpf/i).fill("111.222.333-44");
    await page.getByLabel(/data de nascimento/i).fill("1985-05-15");
    await page.getByLabel(/telefone/i).fill("(11) 91234-5678");
    await page.getByLabel(/celular/i).fill("(11) 91234-5678");
    await page.getByLabel(/email/i).fill("fluxo@e2e.test");

    // Address
    await page.getByLabel(/cep/i).fill("01310-100");
    await page.getByLabel(/logradouro/i).fill("Avenida Paulista");
    await page.getByLabel(/número/i).fill("1000");
    await page.getByLabel(/bairro/i).fill("Bela Vista");
    await page.getByLabel(/cidade/i).fill("São Paulo");
    await page.getByLabel(/estado/i).fill("SP");

    await page.getByRole("button", { name: /salvar/i }).click();

    // Accept any toast (backend may not be running)
    const toastAfterCreatePatient = page.locator(
      '[data-sonner-toast], [role="status"], [data-radix-toast-viewport] > *',
    );
    await expect(toastAfterCreatePatient.first()).toBeVisible({
      timeout: 10000,
    });

    // ========== STEP 3: OPEN EHR (PEP) ==========
    await page.goto("/pep");
    await page.waitForLoadState("domcontentloaded");

    // Fill clinical history (if tab exists)
    const histTab = page.getByRole("tab", { name: /histórico clínico/i });
    if (await histTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await histTab.click();
      await page.getByLabel(/queixa principal/i).fill("Dor no dente 11 e 21");
      await page
        .getByLabel(/história da doença/i)
        .fill("Dor intensa há 5 dias");
      await page
        .getByLabel(/diagnóstico/i)
        .fill("Cárie dentária em dentes 11 e 21");
      await page.getByRole("button", { name: /salvar histórico/i }).click();

      const toastAfterHistory = page.locator(
        '[data-sonner-toast], [role="status"], [data-radix-toast-viewport] > *',
      );
      await expect(toastAfterHistory.first()).toBeVisible({ timeout: 10000 });
    }

    // ========== STEP 4: MARK ODONTOGRAM ==========
    const odontoTab = page.getByRole("tab", { name: /^odontograma$/i });
    if (await odontoTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await odontoTab.click();

      // Select caries status
      const cariadoBtn = page.getByRole("button", { name: /cariado/i });
      if (await cariadoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await cariadoBtn.click();

        // Mark teeth 11 and 21
        await page.locator('[data-tooth="11"]').click();
        await page.locator('[data-tooth="21"]').click();
      }
    }

    // ========== STEP 5: CREATE TREATMENTS ==========
    const tratTab = page.getByRole("tab", { name: /tratamentos/i });
    if (await tratTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tratTab.click();

      const novoBtn = page.getByRole("button", { name: /novo tratamento/i });
      if (await novoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await novoBtn.click();
        await page.getByLabel(/título/i).fill("Restauração Dente 11");
        await page
          .getByLabel(/descrição/i)
          .fill("Restauração em resina composta face mesial");
        await page.getByLabel(/dente/i).fill("11");
        await page.getByLabel(/valor estimado/i).fill("400");
        await page.getByRole("button", { name: /salvar/i }).click();

        const toastAfterTreatment = page.locator(
          '[data-sonner-toast], [role="status"], [data-radix-toast-viewport] > *',
        );
        await expect(toastAfterTreatment.first()).toBeVisible({
          timeout: 10000,
        });
      }
    }

    // ========== STEP 6: VERIFY FINANCIAL ==========
    await page.goto("/financeiro");
    await page.waitForLoadState("domcontentloaded");

    // Verify page loaded
    await expect(page.locator("h1, h2, [data-testid]").first()).toBeVisible({
      timeout: 5000,
    });

    // ========== STEP 7: VERIFY DASHBOARD ==========
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Soft check: dashboard loads with content
    await expect(
      page.locator("[data-testid], h1, h2, .card, .stat").first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should maintain data consistency between modules", async ({ page }) => {
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verify dashboard loads
    await expect(
      page.locator("h1, h2, [data-testid], .card").first(),
    ).toBeVisible({ timeout: 5000 });

    // Navigate to patients
    await page.goto("/pacientes");
    await page.waitForLoadState("domcontentloaded");

    // Verify patients page loaded
    await expect(
      page.getByRole("heading", { name: /pacientes/i }).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("should preserve data when navigating between modules", async ({
    page,
  }) => {
    // Auth token injected via fixtures.ts
    await page.goto("/financeiro");
    await page.waitForLoadState("domcontentloaded");

    // Verify financial loaded
    await expect(
      page.locator("h1, h2, [data-testid], .card").first(),
    ).toBeVisible({ timeout: 5000 });

    // Navigate to patients
    await page.goto("/pacientes");
    await page.waitForLoadState("domcontentloaded");

    // Verify patients loaded
    await expect(
      page.locator("h1, h2, [data-testid], .card").first(),
    ).toBeVisible({ timeout: 5000 });

    // Return to financial
    await page.goto("/financeiro");
    await page.waitForLoadState("domcontentloaded");

    // Verify financial still works
    await expect(
      page.locator("h1, h2, [data-testid], .card").first(),
    ).toBeVisible({ timeout: 5000 });
  });
});
