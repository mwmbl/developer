import { defineConfig, devices } from "@playwright/test";

// Local-only E2E suite that drives the real Next.js dev server and talks to
// the live https://beta.mwmbl.org backend (see src/lib/api.ts). Deliberately
// not wired into `npm test` or CI — see e2e/README.md.
try {
  process.loadEnvFile(".env.e2e.local");
} catch {
  // Optional — required env vars are validated in e2e/fixtures.ts instead.
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
