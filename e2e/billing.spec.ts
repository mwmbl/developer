import { test, expect } from "@playwright/test";
import { signInAndAcceptTerms, requireSandboxCheckoutUrl } from "./fixtures";

// Billing tests are scoped to *initiating* checkout against the real
// backend, not completing a real (even sandboxed) payment end-to-end.
//
// We tried the full flow first: fill the Stripe test card (4242 4242 4242
// 4242) inside Polar's embedded checkout iframe and submit. It's mechanically
// possible — Stripe recognises the test card fine — but the hosted checkout
// form adds country-dependent required fields (e.g. a full street
// address once "United States" is picked) and its billing-country control
// is a portal-rendered combobox that didn't reliably open under Playwright.
// Combined with what looked like rate-limiting after a few repeated checkout
// sessions against the same sandbox account in quick succession, fully
// scripting Polar's UI would make this suite flaky and a maintenance burden
// disproportionate to the value over what's already covered: the "existing
// customer, no checkout" cap-update path is exercised by
// src/components/SpendLimitCard.test.tsx with a mocked API.
//
// What we do verify against the live backend: clicking a spend-cap preset
// for an account with no polar_customer_id actually creates a real Polar
// checkout session and opens it — and, critically, that the URL is on
// Polar's SANDBOX host before anything resembling a payment step is
// reachable, so this suite (or a misconfigured backend) can never end up
// pointed at real Polar.
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await signInAndAcceptTerms(page);
});

test("starting pay-as-you-go for a new customer opens a real, sandboxed Polar checkout", async ({ page }) => {
  const subRes = await page.request.get("https://beta.mwmbl.org/api/v1/platform/billing/subscription", {
    headers: { Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("mwmbl_access"))}` },
  });
  const sub = await subRes.json();
  test.skip(
    sub.polar_customer_id !== null,
    "Test account already has a Polar customer — this spec only covers the brand-new-customer checkout path."
  );

  const checkoutResponsePromise = page.waitForResponse((res) =>
    res.url().includes("/api/v1/platform/billing/checkout")
  );
  await page.getByRole("button", { name: "$10 cap" }).click();

  const checkoutResponse = await checkoutResponsePromise;
  expect(checkoutResponse.ok()).toBeTruthy();
  const { checkout_url: checkoutUrl } = await checkoutResponse.json();

  // Refuse to consider this passing if the backend ever points at real Polar.
  requireSandboxCheckoutUrl(checkoutUrl);

  const checkoutFrame = page.locator("iframe").first().contentFrame();
  await expect(checkoutFrame.locator('input[name="customer_email"]')).toBeVisible({ timeout: 15_000 });

  // We stop here deliberately — see the file-level comment. Confirm we
  // haven't (yet) actually changed the account's billing state.
  const stillFree = await page.request.get("https://beta.mwmbl.org/api/v1/platform/billing/subscription", {
    headers: { Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("mwmbl_access"))}` },
  });
  expect((await stillFree.json()).polar_customer_id).toBeNull();
});
