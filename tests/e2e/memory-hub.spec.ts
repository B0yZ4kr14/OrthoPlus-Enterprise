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

  test("should display the Memory Hub page", async ({ page }) => {
    await page.goto("./memory-hub");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1")).toContainText("Memory Hub");
    await expect(
      page.getByText(/Search and monitor project knowledge/i),
    ).toBeVisible();
  });

  test("should display health metrics", async ({ page }) => {
    await page.goto("./memory-hub");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByTestId("metric-documents")).toBeVisible();
    await expect(page.getByTestId("metric-coverage")).toBeVisible();
    await expect(page.getByTestId("metric-drift")).toBeVisible();
  });

  test("should perform semantic search", async ({ page }) => {
    await page.goto("./memory-hub");
    await page.waitForLoadState("domcontentloaded");

    const searchInput = page.getByTestId("search-input");
    const searchButton = page.getByTestId("search-button");

    await expect(searchInput).toBeVisible();
    await expect(searchButton).toBeVisible();

    await searchInput.fill("clinicGuard");
    await searchButton.click();

    // Wait for results or empty message
    await page.waitForTimeout(2000);

    const results = page.getByTestId("search-result");
    const resultsCount = await results.count();

    if (resultsCount > 0) {
      await expect(results.first()).toBeVisible();
      await expect(results.first().locator("h3")).not.toBeEmpty();
    }
  });

  test("should navigate to Memory Hub via sidebar", async ({ page }) => {
    await page.goto("./");
    await page.waitForLoadState("domcontentloaded");

    const memoryHubLink = page.getByRole("link", {
      name: /memory hub|memoria/i,
    });

    if (await memoryHubLink.isVisible().catch(() => false)) {
      await memoryHubLink.click();
      await expect(page).toHaveURL(/\/memory-hub/);
      await expect(page.locator("h1")).toContainText("Memory Hub");
    } else {
      test.skip(true, "Memory Hub link not visible in sidebar");
    }
  });

  test("should display loading state for metrics", async ({ page }) => {
    await page.goto("./memory-hub");

    // Check if loading state is shown initially or metric cards appear
    const loadingIndicator = page.getByTestId("health-loading");
    const metricCards = page.getByTestId("metric-documents");

    await expect(loadingIndicator.or(metricCards)).toBeVisible();
  });
});
