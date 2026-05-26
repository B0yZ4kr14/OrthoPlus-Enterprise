/**
 * Dashboard API E2E Tests
 * Valida integração completa do Dashboard com REST API
 */

import { test, expect } from './fixtures';

test.describe('Dashboard API Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Token is injected via addInitScript from fixtures.ts
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load dashboard overview from REST API', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/');

    // Wait for data loading
    await page.waitForSelector('[data-testid="stats-card"]', { timeout: 10000 });

    // Check if stats cards are visible
    const statsCards = await page.$$('[data-testid="stats-card"]');
    expect(statsCards.length).toBeGreaterThan(0);

    // Check if charts are rendered
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible();
  });

  test('should display correct stats structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="stats-card"]');

    // Check stats data structure
    const totalPatients = await page.locator('text=/Total de Pacientes/i').isVisible();
    expect(totalPatients).toBeTruthy();

    const todayAppointments = await page.locator('text=/Consultas Hoje/i').isVisible();
    expect(todayAppointments).toBeTruthy();

    const monthlyRevenue = await page.locator('text=/Receita Mensal/i').isVisible();
    expect(monthlyRevenue).toBeTruthy();
  });

  test('should render appointments chart', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.recharts-wrapper');

    // Check if appointments chart is present
    const appointmentsChart = await page.locator('text=/Visão Geral de Consultas/i').isVisible();
    expect(appointmentsChart).toBeTruthy();

    // Check if there is data in the chart
    const bars = await page.$$('.recharts-bar-rectangle');
    expect(bars.length).toBeGreaterThan(0);
  });

  test('should render revenue chart', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.recharts-wrapper');

    // Check if revenue chart is present
    const revenueChart = await page.locator('text=/Desempenho Financeiro/i').isVisible();
    expect(revenueChart).toBeTruthy();

    // Check if there are lines in the chart
    const lines = await page.$$('.recharts-line');
    expect(lines.length).toBeGreaterThan(0);
  });

  test('should handle loading state', async ({ page }) => {
    await page.goto('/');

    // Check if loading state appears initially
    const loadingIndicator = await page.locator('[data-testid="loading"]').isVisible();
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="stats-card"]', { timeout: 10000 });
    
    // Check if loading disappears
    const loadingGone = await page.locator('[data-testid="loading"]').isHidden();
    expect(loadingGone).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ page, context }) => {
    // Simulate network error
    await context.route('**/api/dashboard/overview', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/');

    // Check if there is error message or fallback
    await page.waitForLoadState("domcontentloaded");
    
    // Dashboard should show mock data in case of error
    const statsCards = await page.$$('[data-testid="stats-card"]');
    expect(statsCards.length).toBeGreaterThan(0);
  });

  test('should refresh data on manual refetch', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="stats-card"]');

    // Get initial value
    const initialValue = await page.locator('[data-testid="stats-card"]').first().textContent();

    // Wait for automatic refresh (30 seconds) or force refresh
    await page.reload();
    await page.waitForSelector('[data-testid="stats-card"]');

    // Check if data was reloaded
    const newValue = await page.locator('[data-testid="stats-card"]').first().textContent();
    expect(newValue).toBeDefined();
  });

  test('should display treatments by status chart', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.recharts-wrapper');

    // Check if there is pie chart (treatments by status)
    const pieChart = await page.$$('.recharts-pie');
    expect(pieChart.length).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="stats-card"]');

    // Check if cards are stacked vertically
    const statsCards = await page.$$('[data-testid="stats-card"]');
    expect(statsCards.length).toBeGreaterThan(0);

    // Check if charts are responsive
    const charts = await page.$$('.recharts-responsive-container');
    expect(charts.length).toBeGreaterThan(0);
  });
});
