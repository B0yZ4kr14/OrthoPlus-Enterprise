import { test, expect } from './fixtures';

test.describe('PEP Module - Electronic Health Record', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    // Auth token injected via fixtures.ts
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Navigate to PEP
    await page.getByRole('link', { name: /prontuário|pep/i }).click();
    await page.waitForURL('/pep');
  });

  test('should display record tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /histórico clínico/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /tratamentos/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /odontograma/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /anexos/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /assinatura/i })).toBeVisible();
  });

  test('should fill clinical history', async ({ page }) => {
    // Click clinical history tab
    await page.getByRole('tab', { name: /histórico clínico/i }).click();
    
    // Fill anamnesis
    await page.getByLabel(/queixa principal/i).fill('Dor no dente 11');
    await page.getByLabel(/história da doença/i).fill('Dor há 3 dias');
    
    // Fill diagnosis
    await page.getByLabel(/diagnóstico/i).fill('Cárie dentária');
    
    // Save
    await page.getByRole('button', { name: /salvar histórico/i }).click();
    
    // Check success
    await expect(page.getByText(/histórico salvo/i)).toBeVisible();
  });

  test('should create new treatment', async ({ page }) => {
    // Navigate to treatments tab
    await page.getByRole('tab', { name: /tratamentos/i }).click();
    
    // Click new treatment
    await page.getByRole('button', { name: /novo tratamento/i }).click();
    
    // Fill form
    await page.getByLabel(/título/i).fill('Restauração Dente 11');
    await page.getByLabel(/descrição/i).fill('Restauração em resina composta');
    await page.getByLabel(/dente/i).fill('11');
    await page.getByLabel(/valor estimado/i).fill('500');
    
    // Save
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Check creation
    await expect(page.getByText(/tratamento criado/i)).toBeVisible();
    await expect(page.getByText('Restauração Dente 11')).toBeVisible();
  });

  test('should interact with 2D odontogram', async ({ page }) => {
    // Navigate to odontogram tab
    await page.getByRole('tab', { name: /odontograma/i }).click();
    
    // Select "caries" status
    await page.getByRole('button', { name: /cariado/i }).click();
    
    // Click a tooth (tooth 11)
    await page.locator('[data-tooth="11"]').click();
    
    // Check that the tooth changed color
    await expect(page.locator('[data-tooth="11"]')).toHaveAttribute('data-status', 'cariado');
    
    // Check updated statistics
    await expect(page.getByText(/cariados: 1/i)).toBeVisible();
  });

  test('should upload attachment', async ({ page }) => {
    // Navigate to attachments tab
    await page.getByRole('tab', { name: /anexos/i }).click();
    
    // Create test file
    const fileContent = 'Conteúdo do arquivo de teste';
    const buffer = Buffer.from(fileContent, 'utf-8');
    
    // Upload file
    await page.setInputFiles('input[type="file"]', {
      name: 'teste.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });
    
    // Check upload
    await expect(page.getByText(/arquivo enviado/i)).toBeVisible();
    await expect(page.getByText('teste.txt')).toBeVisible();
  });

  test('should capture digital signature', async ({ page }) => {
    // Navigate to signature tab
    await page.getByRole('tab', { name: /assinatura/i }).click();
    
    // Locate signature canvas
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Simulate signature drawing (drag mouse)
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 100);
      await page.mouse.up();
    }
    
    // Save assinatura
    await page.getByRole('button', { name: /salvar assinatura/i }).click();
    
    // Check success
    await expect(page.getByText(/assinatura salva/i)).toBeVisible();
  });

  test('should view odontogram change history', async ({ page }) => {
    // Navigate to odontogram
    await page.getByRole('tab', { name: /odontograma/i }).click();
    
    // Make some changes
    await page.getByRole('button', { name: /cariado/i }).click();
    await page.locator('[data-tooth="11"]').click();
    
    await page.getByRole('button', { name: /obturado/i }).click();
    await page.locator('[data-tooth="12"]').click();
    
    // Open history
    await page.getByRole('tab', { name: /histórico odonto/i }).click();
    
    // Check that there are entries in history
    await expect(page.getByText(/dente 11/i)).toBeVisible();
    await expect(page.getByText(/dente 12/i)).toBeVisible();
  });
});
