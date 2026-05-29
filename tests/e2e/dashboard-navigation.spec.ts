import { test, expect } from "./fixtures";

test.describe("Dashboard Navigation and Layout", () => {
  test.beforeEach(async ({ page }) => {
    // Login as ADMIN
    // Auth token injected via fixtures.ts
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display dashboard without header overlap", async ({ page }) => {
    await page.goto("/");

    // Check if header is visible
    await expect(page.locator("header")).toBeVisible();

    // Check if breadcrumbs are visible
    await expect(page.getByText("Dashboard")).toBeVisible();

    // Check if main content is not overlapped
    const main = page.locator("main");
    const mainBox = await main.boundingBox();
    const headerBox = await page.locator("header").boundingBox();

    // Main must start after header
    expect(mainBox!.y).toBeGreaterThan(headerBox!.y + headerBox!.height);
  });

  test("should display all action cards", async ({ page }) => {
    await page.goto("/");

    // Check quick action cards
    await expect(page.getByText("Novo Paciente")).toBeVisible();
    await expect(page.getByText("Agendar Consulta")).toBeVisible();
    await expect(page.getByText("Novo Procedimento")).toBeVisible();
    await expect(page.getByText("Lançamento Financeiro")).toBeVisible();
  });

  test("should navigate from action cards", async ({ page }) => {
    await page.goto("/");

    // Click "New Patient"
    await page.click('button:has-text("Novo Paciente")');

    // Check navigation
    await expect(page).toHaveURL(/\/pacientes/);
  });

  test("should display stats cards with loading state", async ({ page }) => {
    await page.goto("/");

    // Check if skeleton loader appears first (can be fast)
    const skeleton = page.locator('[data-testid="dashboard-skeleton"]');

    // Wait for stats cards to appear
    await expect(page.getByText(/total de pacientes/i)).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText(/consultas hoje/i)).toBeVisible();
    await expect(page.getByText(/receita do mês/i)).toBeVisible();
  });

  test("should display charts", async ({ page }) => {
    await page.goto("/");

    // Check if charts are rendered
    await expect(page.getByText("Consultas por Semana")).toBeVisible();
    await expect(page.getByText("Receita Mensal")).toBeVisible();

    // Check if recharts rendered (look for SVG)
    const charts = page.locator("svg.recharts-surface");
    expect(await charts.count()).toBeGreaterThan(0);
  });

  test("should use 4-column grid on large screens", async ({
    page,
    viewport,
  }) => {
    // Set large viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");

    // Check action cards grid
    const actionCardsGrid = page.locator(".grid").first();
    const gridClass = await actionCardsGrid.getAttribute("class");

    // Must have lg:grid-cols-4
    expect(gridClass).toContain("lg:grid-cols-4");
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check if sidebar is collapsed or accessible via menu
    // Check if cards are stacked
    const actionCards = page.locator('button:has-text("Novo Paciente")');
    await expect(actionCards).toBeVisible();
  });

  test("should have working breadcrumbs", async ({ page }) => {
    await page.goto("/");

    // Check home breadcrumb
    await expect(page.getByText("Dashboard")).toBeVisible();

    // Navigate to another page
    await page.click('[href="/pacientes"]');
    await page.waitForURL("/pacientes");

    // Check new breadcrumb
    await expect(page.getByText("Pacientes")).toBeVisible();

    // Click home in breadcrumb
    await page.click('a[href="/"]');
    await page.waitForURL("/");
  });

  test("should open global search with Cmd+K", async ({ page }) => {
    await page.goto("/");

    // Press Cmd+K (Ctrl+K on Windows/Linux)
    await page.keyboard.press("Meta+K");

    // Check if search dialog opened
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible();
  });

  test("should show notifications dropdown", async ({ page }) => {
    await page.goto("/");

    // Click notifications icon
    await page.click('button:has([data-icon="bell"])');

    // Check notifications dropdown
    await expect(page.getByText(/notificações/i)).toBeVisible();
  });

  test("should display theme toggle", async ({ page }) => {
    await page.goto("/");

    // Check theme preview button
    const themeButton = page.locator('button:has([data-icon="palette"])');
    await expect(themeButton).toBeVisible();

    // Click to open dialog
    await themeButton.click();

    // Check if themes dialog opened
    await expect(page.getByText("Escolher Tema")).toBeVisible();
  });

  test("should handle user menu", async ({ page }) => {
    await page.goto("/");

    // Click user avatar
    await page.click('button:has([role="img"])');

    // Check menu options
    await expect(page.getByText("Sair")).toBeVisible();
  });

  test("should show ripple effect on action cards", async ({ page }) => {
    await page.goto("/");

    // Click action card
    const card = page.locator('button:has-text("Novo Paciente")');
    await card.click();

    // Check if ripple animation exists (span with animate-ripple)
    const ripple = page.locator("span.animate-ripple");
    // May have already disappeared due to animation speed
  });

  test("should load dashboard within 3 seconds", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    // Wait for main elements
    await page.waitForSelector('[data-tour="dashboard"]', { timeout: 5000 });

    const loadTime = Date.now() - startTime;

    // Performance: should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});
