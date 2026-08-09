import { type Page, expect } from "@playwright/test";

export interface TestCredentials {
  email: string;
  password: string;
}

// The shared test account must already exist and have a confirmed email on
// beta.mwmbl.org — see e2e/README.md. We deliberately don't create/confirm a
// fresh account per run, since email confirmation can't be automated here.
export function requireTestCredentials(): TestCredentials {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be set to run authenticated e2e specs. " +
        "See e2e/README.md for how to configure .env.e2e.local."
    );
  }
  return { email, password };
}

// Signs in via the real /signin form and real backend, landing on either
// /dashboard (terms already accepted) or /agree (terms pending).
export async function signIn(page: Page): Promise<void> {
  const { email, password } = requireTestCredentials();
  await page.goto("/signin");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/(dashboard|agree)\/?(\?.*)?$/, { timeout: 20_000 });
}

// Signs in and makes sure the account has accepted the Terms of Service,
// since API-key creation and spend-cap changes are gated on it.
export async function signInAndAcceptTerms(page: Page): Promise<void> {
  await signIn(page);
  if (page.url().includes("/agree")) {
    await acceptTermsOnAgreePage(page);
  } else {
    // Already on /dashboard (signIn() landed here directly) — check via the
    // banner rather than reloading, which would needlessly re-fetch session
    // state.
    const acceptLink = page.getByRole("link", { name: "Accept Terms →" });
    if (await acceptLink.isVisible().catch(() => false)) {
      await acceptLink.click();
      await acceptTermsOnAgreePage(page);
    }
  }
  await expect(page).toHaveURL(/\/dashboard\/?(\?.*)?$/, { timeout: 20_000 });
}

async function acceptTermsOnAgreePage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/agree\/?(\?.*)?$/);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Accept and continue" }).click();
}

// Polar's checkout embed only allows its own domains as iframe parents/targets
// (see node_modules/@polar-sh/checkout/dist/embed.global.js), which lists
// "https://polar.sh" (production) and "https://sandbox.polar.sh" (sandbox).
// The beta backend is expected to be wired to Polar's sandbox; refuse to
// proceed with anything that looks like a real checkout.
const SANDBOX_CHECKOUT_HOSTNAME = "sandbox.polar.sh";

export function requireSandboxCheckoutUrl(checkoutUrl: string): void {
  const hostname = new URL(checkoutUrl).hostname;
  if (hostname !== SANDBOX_CHECKOUT_HOSTNAME) {
    throw new Error(
      `Refusing to proceed with checkout: expected the Polar SANDBOX host ` +
        `("${SANDBOX_CHECKOUT_HOSTNAME}") but got "${hostname}" (full URL: ${checkoutUrl}). ` +
        "The backend may have been pointed at real Polar — aborting before entering any card details."
    );
  }
}

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}
