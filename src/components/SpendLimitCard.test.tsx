import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SpendLimitCard } from "./SpendLimitCard";
import { updateSpendLimit, createCheckout } from "@/lib/api";
import type { Subscription } from "@/lib/api";

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    createCheckout: vi.fn(),
    cancelSubscription: vi.fn(),
    uncancelSubscription: vi.fn(),
    updateSpendLimit: vi.fn(),
  };
});

vi.mock("@polar-sh/checkout/embed", () => ({
  PolarEmbedCheckout: {
    create: vi.fn().mockResolvedValue({
      addEventListener: vi.fn(),
      close: vi.fn(),
    }),
  },
}));

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    status: "free",
    max_monthly_spend_cents: 0,
    monthly_limit: 2000,
    monthly_usage: 0,
    estimated_cost_cents: 0,
    current_period_end: null,
    polar_customer_id: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SpendLimitCard", () => {
  test("shows free-tier copy when no cap is set", () => {
    render(<SpendLimitCard sub={makeSub()} canUpgrade onUpdate={vi.fn()} />);
    expect(screen.getByText(/you're on the free tier/i)).toBeInTheDocument();
  });

  test("shows the exact cap amount, not rounded to the nearest dollar", () => {
    render(<SpendLimitCard sub={makeSub({ max_monthly_spend_cents: 1999, polar_customer_id: "cus_1" })} canUpgrade onUpdate={vi.fn()} />);
    expect(screen.getByText(/\$19\.99 monthly cap/)).toBeInTheDocument();
    expect(screen.queryByText(/\$20 monthly cap/)).not.toBeInTheDocument();
  });

  // Regression test: currentCapCents used to be seeded into local state via
  // useState(sub.max_monthly_spend_cents) and never re-derived, so external
  // updates to `sub` (e.g. the post-checkout polling effect in
  // DashboardContent) left the card showing stale data until a full reload.
  test("reflects a cap change that arrives via a prop update, not just its own button clicks", () => {
    const { rerender } = render(
      <SpendLimitCard sub={makeSub({ max_monthly_spend_cents: 0 })} canUpgrade onUpdate={vi.fn()} />
    );
    expect(screen.getByText(/you're on the free tier/i)).toBeInTheDocument();

    rerender(
      <SpendLimitCard
        sub={makeSub({ max_monthly_spend_cents: 2500, polar_customer_id: "cus_1" })}
        canUpgrade
        onUpdate={vi.fn()}
      />
    );

    expect(screen.queryByText(/you're on the free tier/i)).not.toBeInTheDocument();
    expect(screen.getByText(/\$25 monthly cap/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\$25 cap/i })).toBeDisabled();
  });

  test("clicking a preset for an existing customer updates the cap directly, without checkout", async () => {
    const onUpdate = vi.fn();
    const updated = makeSub({ max_monthly_spend_cents: 1000, polar_customer_id: "cus_1" });
    vi.mocked(updateSpendLimit).mockResolvedValue(updated);

    render(
      <SpendLimitCard sub={makeSub({ polar_customer_id: "cus_1" })} canUpgrade onUpdate={onUpdate} />
    );
    fireEvent.click(screen.getByRole("button", { name: /\$10 cap/i }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(updated));
    expect(updateSpendLimit).toHaveBeenCalledWith(1000);
    expect(createCheckout).not.toHaveBeenCalled();
  });

  test("clicking a preset for a brand-new customer starts checkout instead of setting the cap directly", async () => {
    vi.mocked(createCheckout).mockResolvedValue({ checkout_url: "https://checkout.example/session" });

    render(
      <SpendLimitCard sub={makeSub({ polar_customer_id: null })} canUpgrade onUpdate={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /\$10 cap/i }));

    await waitFor(() => expect(createCheckout).toHaveBeenCalled());
    expect(updateSpendLimit).not.toHaveBeenCalled();
  });

  test("preset buttons are disabled when the user hasn't accepted the Terms of Service", () => {
    render(<SpendLimitCard sub={makeSub()} canUpgrade={false} onUpdate={vi.fn()} />);
    expect(screen.getByRole("button", { name: /\$10 cap/i })).toBeDisabled();
  });
});
