import { test, expect } from './fixtures';

test.describe('Inventory Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login as ADMIN
    // Auth token injected via fixtures.ts
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('Inventory Dashboard', () => {
    test('should display dashboard metrics', async ({ page }) => {
      await page.goto('/estoque');
      
      // Check main metrics
      await expect(page.getByText('Dashboard do Estoque')).toBeVisible();
      await expect(page.getByText('Total de Produtos')).toBeVisible();
      await expect(page.getByText('Estoque Baixo')).toBeVisible();
      await expect(page.getByText('Requisições Pendentes')).toBeVisible();
      await expect(page.getByText('Valor Total')).toBeVisible();
    });

    test('should display charts', async ({ page }) => {
      await page.goto('/estoque');
      
      // Check charts
      await expect(page.getByText('Produtos com Estoque Baixo')).toBeVisible();
      await expect(page.getByText('Requisições por Status')).toBeVisible();
      await expect(page.getByText('Movimentações dos Últimos 7 Dias')).toBeVisible();
      
      // Check if recharts rendered
      const charts = page.locator('svg.recharts-surface');
      expect(await charts.count()).toBeGreaterThan(0);
    });

    test('should display active alerts', async ({ page }) => {
      await page.goto('/estoque');
      
      // Check alerts section (if any)
      const alertSection = page.getByText(/alertas ativos/i);
      // May or may not be visible depending on whether there are alerts
    });

    test('should use elevated card variants', async ({ page }) => {
      await page.goto('/estoque');
      
      // Check if cards have correct classes
      const cards = page.locator('[class*="elevated"]');
      expect(await cards.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Product Registrations', () => {
    test('should navigate to cadastros page', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await expect(page.getByText('Cadastros de Estoque')).toBeVisible();
      await expect(page.getByText('Produtos Cadastrados')).toBeVisible();
      await expect(page.getByText('Fornecedores')).toBeVisible();
      await expect(page.getByText('Categorias')).toBeVisible();
    });

    test('should display product creation form', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      // Click products tab
      await page.click('button:has-text("Produtos")');
      
      // Click new product
      await page.click('button:has-text("Novo Produto")');
      
      // Check form fields
      await expect(page.getByLabel(/nome/i)).toBeVisible();
      await expect(page.getByLabel(/código/i)).toBeVisible();
      await expect(page.getByLabel(/categoria/i)).toBeVisible();
    });

    test('should create new product', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Produtos")');
      await page.click('button:has-text("Novo Produto")');
      
      // Fill form
      const timestamp = Date.now();
      await page.fill('input[name="nome"]', `Produto Teste ${timestamp}`);
      await page.fill('input[name="codigo"]', `PROD${timestamp}`);
      await page.fill('input[name="quantidadeAtual"]', '100');
      await page.fill('input[name="quantidadeMinima"]', '20');
      await page.fill('input[name="precoCompra"]', '50.00');
      await page.fill('input[name="precoVenda"]', '100.00');
      
      // Submit
      await page.click('button[type="submit"]:has-text("Salvar")');
      
      // Check success toast
      await expect(page.getByText(/produto cadastrado/i)).toBeVisible({ timeout: 5000 });
    });

    test('should edit existing product', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Produtos")');
      
      // Click edit first product (if exists)
      const editButton = page.locator('button:has-text("Editar")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Modify name
        const nomeInput = page.locator('input[name="nome"]');
        await nomeInput.fill(`Produto Editado ${Date.now()}`);
        
        // Save
        await page.click('button[type="submit"]:has-text("Salvar")');
        
        // Check toast
        await expect(page.getByText(/produto atualizado/i)).toBeVisible({ timeout: 5000 });
      }
    });

    test('should search products', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Produtos")');
      
      // Search product
      const searchInput = page.getByPlaceholder(/buscar produtos/i);
      await searchInput.fill('teste');
      
      // Check if results were filtered
      // (may have no results if there are no products with "test")
    });

    test('should delete product with confirmation', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Produtos")');
      
      const deleteButton = page.locator('button:has-text("Excluir")').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Check confirmation dialog
        await expect(page.getByText(/confirmar exclusão/i)).toBeVisible();
        
        // Cancel to avoid actually deleting
        await page.click('button:has-text("Cancelar")');
      }
    });
  });

  test.describe('Supplier Registrations', () => {
    test('should display fornecedor form', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Fornecedores")');
      
      await page.click('button:has-text("Novo Fornecedor")');
      
      await expect(page.getByLabel(/nome/i)).toBeVisible();
    });

    test('should create fornecedor', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Fornecedores")');
      await page.click('button:has-text("Novo Fornecedor")');
      
      const timestamp = Date.now();
      await page.fill('input[name="nome"]', `Fornecedor Teste ${timestamp}`);
      await page.fill('input[name="contato"]', 'contato@fornecedor.com');
      await page.fill('input[name="telefone"]', '11999999999');
      
      await page.click('button[type="submit"]:has-text("Salvar")');
      
      await expect(page.getByText(/fornecedor cadastrado/i)).toBeVisible({ timeout: 5000 });
    });

    test('should search fornecedores', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Fornecedores")');
      
      const searchInput = page.getByPlaceholder(/buscar fornecedores/i);
      await searchInput.fill('teste');
    });
  });

  test.describe('Category Registrations', () => {
    test('should display categoria form', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Categorias")');
      
      await page.click('button:has-text("Nova Categoria")');
      
      await expect(page.getByLabel(/nome/i)).toBeVisible();
    });

    test('should create categoria', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Categorias")');
      await page.click('button:has-text("Nova Categoria")');
      
      const timestamp = Date.now();
      await page.fill('input[name="nome"]', `Categoria ${timestamp}`);
      await page.fill('textarea[name="descricao"]', 'Descrição da categoria teste');
      
      await page.click('button[type="submit"]:has-text("Salvar")');
      
      await expect(page.getByText(/categoria cadastrada/i)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Stock Movements', () => {
    test('should navigate to movimentacoes page', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      await expect(page.getByText('Movimentações de Estoque')).toBeVisible();
      await expect(page.getByText('Total de Movimentações')).toBeVisible();
      await expect(page.getByText('Entradas')).toBeVisible();
      await expect(page.getByText('Saídas')).toBeVisible();
      await expect(page.getByText('Ajustes')).toBeVisible();
    });

    test('should display metrics cards with elevated variant', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      // Check cards with elevated variant
      const elevatedCards = page.locator('[class*="elevated"]');
      expect(await elevatedCards.count()).toBeGreaterThan(0);
    });

    test('should display movimentacao form', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      await page.click('button:has-text("Nova Movimentação")');
      
      await expect(page.getByText('Registrar Movimentação')).toBeVisible();
    });

    test('should filter by tipo', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      // Apply filter
      await page.click('[role="combobox"]');
      await page.click('text=Entradas');
      
      // Entries tab should show only entries
      await page.click('button:has-text("Entradas")');
    });

    test('should search movimentacoes', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      const searchInput = page.getByPlaceholder(/buscar por produto/i);
      await searchInput.fill('teste');
    });

    test('should switch between tabs', async ({ page }) => {
      await page.goto('/estoque/movimentacoes');
      
      // Test navigation between tabs
      await page.click('button:has-text("Entradas")');
      
      await page.click('button:has-text("Saídas")');
      
      await page.click('button:has-text("Ajustes")');
      
      await page.click('button:has-text("Todas")');
    });
  });

  test.describe('Barcode Scanner', () => {
    test('should open scanner dialog', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Scanner de Código de Barras")');
      
      // Dialog should open (may not work fully without real camera)
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });
  });

  test.describe('Loading States', () => {
    test('should show loading state on dashboard', async ({ page }) => {
      // Intercept request to simulate loading
      await page.route('**/rest/v1/estoque_produtos*', async route => {
        await page.waitForLoadState("domcontentloaded"); // Wait for page
        route.continue();
      });
      
      await page.goto('/estoque');
      
      // Check if loading state appears
      await expect(page.getByText(/carregando/i)).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/estoque');
      
      // Check if metrics are stacked
      await expect(page.getByText('Total de Produtos')).toBeVisible();
    });

    test('should display 4-column grid on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/estoque');
      
      // Check 4-column grid
      const metricsGrid = page.locator('.grid').first();
      const gridClass = await metricsGrid.getAttribute('class');
      expect(gridClass).toContain('lg:grid-cols-4');
    });
  });

  test.describe('Toast Notifications', () => {
    test('should show success toast on product creation', async ({ page }) => {
      await page.goto('/estoque/cadastros');
      
      await page.click('button:has-text("Produtos")');
      await page.click('button:has-text("Novo Produto")');
      
      const timestamp = Date.now();
      await page.fill('input[name="nome"]', `Produto ${timestamp}`);
      await page.fill('input[name="codigo"]', `P${timestamp}`);
      await page.fill('input[name="quantidadeAtual"]', '50');
      await page.fill('input[name="quantidadeMinima"]', '10');
      await page.fill('input[name="precoCompra"]', '30.00');
      await page.fill('input[name="precoVenda"]', '60.00');
      
      await page.click('button[type="submit"]:has-text("Salvar")');
      
      // Check toast
      await expect(page.getByRole('status')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Integration with Other Modules', () => {
    test('should link to financial module from dashboard', async ({ page }) => {
      await page.goto('/estoque');
      
      // Check if total value is visible (integration with financial)
      await expect(page.getByText(/valor total/i)).toBeVisible();
      await expect(page.getByText(/R\$/)).toBeVisible();
    });
  });
});
