import { describe, expect, test, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";
import { getSubscription, updateSpendLimit, listApiKeys, ApiError } from "@/lib/api";
import type { Subscription } from "@/lib/api";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} alt={props.alt as string} />,
}));

// Stable references (not recreated per render) so the effects in
// DashboardContent that depend on `router`/`user` don't re-fire on every
// render and reset the poll interval before it ever gets to fire.
const { mockRouter, mockAuthValue, searchParamsRef } = vi.hoisted(() => {
  return {
    mockRouter: { push: () => {}, replace: () => {} },
    mockAuthValue: {
      user: { username: "alice", email: "alice@example.com", plan: "pay_as_you_go", email_confirmed: true },
      loading: false,
      signOut: () => {},
      refreshUser: () => Promise.resolve(),
      hasAgreedToTerms: true,
    },
    searchParamsRef: { current: new URLSearchParams() },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => searchParamsRef.current,
}));

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => mockAuthValue,
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getSubscription: vi.fn(),
    updateSpendLimit: vi.fn(),
    listApiKeys: vi.fn(),
    createApiKey: vi.fn(),
    deleteApiKey: vi.fn(),
  };
});

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
  searchParamsRef.current = new URLSearchParams();
  vi.mocked(listApiKeys).mockResolvedValue([]);
});

describe("DashboardPage post-checkout spend cap flow", () => {
  test("surfaces an error instead of failing silently when applying the pending cap fails", async () => {
    searchParamsRef.current = new URLSearchParams({ billing: "true", pendingCapCents: "2500" });

    vi.mocked(getSubscription)
      .mockResolvedValueOnce(makeSub({ polar_customer_id: null }))
      .mockResolvedValue(makeSub({ polar_customer_id: "cus_1" }));
    vi.mocked(updateSpendLimit).mockRejectedValue(new ApiError(500, "spend-limit failed"));

    render(<DashboardPage />);

    expect(
      await screen.findByText(/we couldn't apply your \$25 spend cap/i, {}, { timeout: 6000 })
    ).toBeInTheDocument();
    expect(updateSpendLimit).toHaveBeenCalledWith(2500);
  }, 10000);

  test("applies the pending cap and shows no warning when it succeeds", async () => {
    searchParamsRef.current = new URLSearchParams({ billing: "true", pendingCapCents: "2500" });

    vi.mocked(getSubscription)
      .mockResolvedValueOnce(makeSub({ polar_customer_id: null }))
      .mockResolvedValue(makeSub({ polar_customer_id: "cus_1" }));
    vi.mocked(updateSpendLimit).mockResolvedValue(
      makeSub({ polar_customer_id: "cus_1", max_monthly_spend_cents: 2500 })
    );

    render(<DashboardPage />);

    expect(
      await screen.findByText(/\$25 monthly cap/, {}, { timeout: 6000 })
    ).toBeInTheDocument();
    expect(screen.queryByText(/couldn't apply/i)).not.toBeInTheDocument();
  }, 10000);
});
