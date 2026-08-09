import { test, expect } from "@playwright/test";

// These specs hit the real backend (https://api.mwmbl.org for anonymous
// search) and require no authentication.

test.describe("home page", () => {
  test("renders hero, pricing tiers, and footer", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Your gateway to the");
    await expect(page.getByRole("heading", { name: "Simple, transparent pricing" })).toBeVisible();

    // Tier names share text with tier prices ("Free" is both a name and a
    // price), so scope to the name element specifically.
    const tierNames = page.locator("p.uppercase.tracking-widest");
    await expect(tierNames).toHaveText(["Anonymous", "Free", "Pay as you go", "Enterprise"]);

    await expect(page.getByRole("contentinfo")).toContainText("Mwmbl community");
  });

  test("runs a real anonymous search against the live API", async ({ page }) => {
    await page.goto("/");

    const searchBox = page.getByPlaceholder("Search the ethical web…");
    await searchBox.fill("open source search engine");

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes("api.mwmbl.org/api/v2/search/") && res.request().method() === "GET"
    );
    await page.getByRole("button", { name: "RUN" }).click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty("results");
    expect(body).toHaveProperty("number_of_results");

    // The JSON response pane should render without the demo's own error state.
    await expect(page.getByText(/^\/\/ Error:/)).not.toBeVisible();
  });
});

test.describe("nav", () => {
  test("shows sign in / sign up when signed out", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav.getByRole("link", { name: "Sign In" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Sign Up" })).toBeVisible();
  });

  test("mobile hamburger opens and closes the dropdown", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Toggle menu" });
    const mobileSignIn = page.locator("div.sm\\:hidden").getByRole("link", { name: "Sign In" });

    await expect(mobileSignIn).not.toBeVisible();
    await toggle.click();
    await expect(mobileSignIn).toBeVisible();
    await toggle.click();
    await expect(mobileSignIn).not.toBeVisible();
  });
});

test.describe("pricing CTAs", () => {
  test("anonymous, free, and pay-as-you-go tiers link where expected", async ({ page }) => {
    await page.goto("/#pricing");
    // Scope to the pricing section — the nav also has a "Sign Up" link, and
    // Playwright's accessible-name matching is case-insensitive by default.
    const pricing = page.locator("#pricing");

    await expect(pricing.getByRole("link", { name: "Try it now" })).toHaveAttribute("href", "/#demo");
    await expect(pricing.getByRole("link", { name: "Get started" })).toHaveAttribute("href", "/signup/");
    await expect(pricing.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup/");
    await expect(pricing.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "mailto:hello@mwmbl.org"
    );
  });
});
