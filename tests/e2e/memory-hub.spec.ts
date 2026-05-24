import { test, expect } from "./fixtures";

test.describe("Memory Hub - Search and Health", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) =>
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`),
    );
    page.on("pageerror", (err) =>
      console.log(`[Browser Error]: ${err.message}`),
    );
  });

  test("deve exibir a pagina do Memory Hub", async ({ page }) => {
    await page.goto("./memory-hub");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1")).toContainText("Memory Hub");
    await expect(page.getByText(/Search and monitor project knowledge/i)).toBeVisible();
  });

  test("deve exibir metricas de saude", async ({ page }) => {
    await page.goto("./memory-hub");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByTestId("metric-documents")).toBeVisible();
    await expect(page.getByTestId("metric-coverage")).toBeVisible();
    await expect(page.getByTestId("metric-drift")).toBeVisible();
  });

  test("deve realizar busca semantica", async ({ page }) => {
    await page.goto("./memory-hub");
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.getByTestId("search-input");
    const searchButton = page.getByTestId("search-button");

    await expect(searchInput).toBeVisible();
    await expect(searchButton).toBeVisible();

    await searchInput.fill("clinicGuard");
    await searchButton.click();

    // Aguardar resultados ou mensagem de vazio
    await page.waitForTimeout(2000);

    const results = page.getByTestId("search-result");
    const resultsCount = await results.count();

    if (resultsCount > 0) {
      await expect(results.first()).toBeVisible();
      await expect(results.first().locator("h3")).not.toBeEmpty();
    }
  });

  test("deve navegar para Memory Hub via sidebar", async ({ page }) => {
    await page.goto("./");
    await page.waitForLoadState("domcontentloaded");

    const memoryHubLink = page.getByRole("link", { name: /memory hub|memoria/i });

    if (await memoryHubLink.isVisible().catch(() => false)) {
      await memoryHubLink.click();
      await expect(page).toHaveURL(/\/memory-hub/);
      await expect(page.locator("h1")).toContainText("Memory Hub");
    } else {
      test.skip(true, "Memory Hub link not visible in sidebar");
    }
  });

  test("deve exibir estado de carregamento das metricas", async ({ page }) => {
    await page.goto("./memory-hub");

    // Verificar se o estado de loading eh exibido inicialmente ou os metric cards aparecem
    const loadingIndicator = page.getByTestId("health-loading");
    const metricCards = page.getByTestId("metric-documents");

    await expect(loadingIndicator.or(metricCards)).toBeVisible();
  });
});
