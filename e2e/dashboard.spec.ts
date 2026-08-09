import { test, expect } from "@playwright/test";
import { signInAndAcceptTerms } from "./fixtures";

// Stateful — runs against the one shared test account, in order, so the API
// key lifecycle test can rely on terms already being accepted, and so runs
// don't clobber each other.
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await signInAndAcceptTerms(page);
});

test("shows real usage numbers and no unaccepted-terms banner", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Usage this month" })).toBeVisible();
  await expect(page.getByText("Requests", { exact: true })).toBeVisible();
  await expect(page.getByText(/^[\d,]+\s*\/\s*[\d,]+$/)).toBeVisible();

  await expect(page.getByText("Accept our Terms of Service to create API keys")).not.toBeVisible();
});

test("creates and then revokes an API key", async ({ page }) => {
  const keyName = `e2e-key-${Date.now()}`;

  await page.getByPlaceholder("Key name (optional)").fill(keyName);
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Your new API key")).toBeVisible({ timeout: 15_000 });
  const keyRow = page.getByRole("listitem").filter({ hasText: keyName });
  await expect(keyRow).toBeVisible();

  await keyRow.getByRole("button", { name: "Revoke key" }).click();
  await keyRow.getByRole("button", { name: "Yes" }).click();
  await expect(keyRow).toHaveCount(0);
});
