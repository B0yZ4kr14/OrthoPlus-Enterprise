import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  // globalSetup removed — using project dependency + storageState instead
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results.json" }],
    ["list"],
  ],

  use: {
    baseURL: "http://localhost:8080/OrthoPlus-Enterprise/",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/state.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "tests/e2e/.auth/state.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: "tests/e2e/.auth/state.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        storageState: "tests/e2e/.auth/state.json",
      },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
        storageState: "tests/e2e/.auth/state.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: [
    {
      command: "npm run dev",
      cwd: "./backend",
      url: "http://localhost:3005/health",
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: "cd apps/web && pnpm preview --port 8080 --host",
      url: "http://localhost:8080/OrthoPlus-Enterprise/",
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
