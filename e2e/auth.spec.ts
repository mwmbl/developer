import { test, expect } from "@playwright/test";
import { requireTestCredentials, signIn, uniqueEmail } from "./fixtures";

test.describe("signin", () => {
  test("shows an error for a wrong password instead of navigating away", async ({ page }) => {
    const { email } = requireTestCredentials();
    await page.goto("/signin");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill("definitely-the-wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Usually a 401 ("Invalid email or password."), but if the backend is
    // rate-limiting login attempts (e.g. after this suite has just run many
    // real sign-ins) it can instead return a different error, which the UI
    // falls back to a generic message for — either way, the key behavior
    // we're checking is that a wrong password surfaces *some* error and
    // never navigates away from /signin.
    await expect(
      page.getByText(/Invalid email or password\.|Something went wrong\. Please try again\./)
    ).toBeVisible();
    await expect(page).toHaveURL(/\/signin\/?$/);
  });

  test("signs in with the real test account and lands on dashboard or agree", async ({ page }) => {
    await signIn(page);
    await expect(page).toHaveURL(/\/(dashboard|agree)\/?(\?.*)?$/);
  });
});

test.describe("signup", () => {
  // Registers a fresh throwaway account against the real backend. Per the
  // live OpenAPI spec (api-1(1).yaml), `username` is optional at register
  // time (auto-generated if omitted), so this is expected to succeed even
  // though the form only collects email/password — api-requirements.md's
  // note that username is required is stale.
  test("creates an account against the live backend", async ({ page }) => {
    const email = uniqueEmail("e2e-signup");

    await page.goto("/signup");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("correct-horse-battery-staple");
    await page.getByLabel("Confirm password").fill("correct-horse-battery-staple");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("heading", { name: "Account created!" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/check your inbox to verify/i)).toBeVisible();
    // We deliberately stop here — completing confirmation requires reading a
    // real inbox, which this suite doesn't have access to.
  });

  test("requires agreeing to the Terms of Service before submitting", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Email address").fill(uniqueEmail("e2e-noterms"));
    await page.getByLabel("Password", { exact: true }).fill("correct-horse-battery-staple");
    await page.getByLabel("Confirm password").fill("correct-horse-battery-staple");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("You must agree to the Terms of Service to create an account.")).toBeVisible();
  });

  test("rejects mismatched passwords client-side", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Email address").fill(uniqueEmail("e2e-mismatch"));
    await page.getByLabel("Password", { exact: true }).fill("correct-horse-battery-staple");
    await page.getByLabel("Confirm password").fill("something-else-entirely");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match.")).toBeVisible();
  });
});

test.describe("confirm-email", () => {
  test("shows an invalid-link state without email/key params", async ({ page }) => {
    await page.goto("/confirm-email");
    await expect(page.getByRole("heading", { name: "Invalid link" })).toBeVisible();
  });
});
