"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  createCheckout, cancelSubscription, uncancelSubscription, updateSpendLimit,
  ApiError, Subscription,
} from "@/lib/api";
import { SPEND_LIMIT_PRESETS_CENTS, FREE_KEY_REQUESTS, CENTS_PER_1000_REQUESTS, formatUsd } from "@/lib/pricing";

interface SpendLimitCardProps {
  sub: Subscription;
  canUpgrade: boolean;
  onUpdate: (sub: Subscription) => void;
}

export function SpendLimitCard({ sub, canUpgrade, onUpdate }: SpendLimitCardProps) {
  // Cancellation state is tracked optimistically — API responses still reflect
  // pre-webhook state, so we can't rely on sub.status directly right after a change.
  // The spend cap itself is read straight from the `sub` prop (not mirrored into local
  // state) so it stays correct even when it's updated from outside this component, e.g.
  // by the post-checkout polling effect in DashboardContent.
  const currentCapCents = sub.max_monthly_spend_cents;
  const [isPendingCancellation, setIsPendingCancellation] = useState(
    sub.status !== "active" && sub.status !== "canceled" && sub.status !== "free"
  );
  const [periodEnd, setPeriodEnd] = useState(sub.current_period_end);

  const [customDollars, setCustomDollars] = useState("");
  const [loadingCents, setLoadingCents] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [uncancelling, setUncancelling] = useState(false);

  const handleSetCap = async (cents: number) => {
    setError(null);
    setLoadingCents(cents);
    try {
      if (cents > 0 && !sub.polar_customer_id) {
        const successUrl = `${window.location.origin}/dashboard?billing=true&pendingCapCents=${cents}`;
        const { checkout_url } = await createCheckout(window.location.origin, successUrl);
        const { PolarEmbedCheckout } = await import("@polar-sh/checkout/embed");
        const checkout = await PolarEmbedCheckout.create(checkout_url);
        checkout.addEventListener("success", (event) => {
          event.preventDefault();
          checkout.close();
          window.location.href = successUrl;
        });
        return;
      }
      const updated = await updateSpendLimit(cents);
      onUpdate(updated);
      setCustomDollars("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update spend limit.");
    } finally {
      setLoadingCents(null);
    }
  };

  const handleCustomSubmit = () => {
    const dollars = parseFloat(customDollars);
    if (!Number.isFinite(dollars) || dollars < 0) return;
    void handleSetCap(Math.round(dollars * 100));
  };

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      const updated = await cancelSubscription();
      onUpdate(updated);
      setIsPendingCancellation(true);
      setPeriodEnd(updated.current_period_end);
      setConfirmCancel(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to cancel pay-as-you-go billing.");
    } finally {
      setCancelling(false);
    }
  };

  const handleUncancel = async () => {
    setUncancelling(true);
    setError(null);
    try {
      const updated = await uncancelSubscription();
      onUpdate(updated);
      setIsPendingCancellation(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to restore billing.");
    } finally {
      setUncancelling(false);
    }
  };

  const busy = loadingCents !== null || cancelling || uncancelling;
  const freeRequests = FREE_KEY_REQUESTS.toLocaleString();
  const pricePer1000 = formatUsd(CENTS_PER_1000_REQUESTS);

  return (
    <div className="border border-border bg-card rounded-sm p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Pay-as-you-go billing</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {currentCapCents > 0
              ? `Beyond your free ${freeRequests} requests, usage is billed at ${pricePer1000} per 1,000 requests, up to a ${formatUsd(currentCapCents)} monthly cap.`
              : `You're on the free tier — ${freeRequests} requests/month, hard-capped. Set a spend cap to unlock more.`}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      {isPendingCancellation && periodEnd && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-sm px-4 py-3">
          <AlertCircle size={13} className="shrink-0" />
          Your spend cap remains active until{" "}
          {new Date(periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}, then
          your account returns to the free {freeRequests} req/month limit.
        </div>
      )}

      {!isPendingCancellation && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {SPEND_LIMIT_PRESETS_CENTS.map((cents) => (
              <button
                key={cents}
                onClick={() => void handleSetCap(cents)}
                disabled={busy || !canUpgrade || currentCapCents === cents}
                title={!canUpgrade ? "Accept the Terms of Service to change your spend cap" : undefined}
                className="px-4 py-2 border border-accent-text text-accent-text text-xs font-bold rounded-sm hover:bg-accent-text hover:text-background transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {loadingCents === cents && <Loader2 size={12} className="animate-spin" />}
                {formatUsd(cents)} cap
              </button>
            ))}
            {currentCapCents > 0 && (
              <button
                onClick={() => void handleSetCap(0)}
                disabled={busy || !canUpgrade}
                className="px-4 py-2 border border-border text-muted-foreground text-xs font-bold rounded-sm hover:border-accent-text hover:text-accent-text transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {loadingCents === 0 && <Loader2 size={12} className="animate-spin" />}
                Free tier only
              </button>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleCustomSubmit(); }}
            className="flex gap-2"
          >
            <div className="relative flex-1 max-w-[160px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <input
                type="number"
                min="0"
                step="1"
                value={customDollars}
                onChange={(e) => setCustomDollars(e.target.value)}
                placeholder="Custom (0 to pause)"
                disabled={busy || !canUpgrade}
                className="w-full bg-transparent border border-border rounded-sm pl-6 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent-text transition-colors font-mono disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !canUpgrade || !customDollars}
              className="px-4 py-2 bg-accent-text text-background text-xs font-bold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
            >
              Set cap
            </button>
          </form>
        </div>
      )}

      {sub.polar_customer_id && (
        isPendingCancellation ? (
          <button
            onClick={() => void handleUncancel()}
            disabled={busy}
            className="w-fit px-4 py-2 border border-border text-muted-foreground text-xs font-bold rounded-sm hover:border-accent-text hover:text-accent-text transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {uncancelling && <Loader2 size={12} className="animate-spin" />}
            Keep pay-as-you-go billing
          </button>
        ) : confirmCancel ? (
          <div className="w-fit flex items-center gap-3 border border-destructive/30 rounded-sm px-4 py-2">
            <span className="text-xs text-muted-foreground">Cancel at period end?</span>
            <button
              onClick={() => void handleCancel()}
              disabled={cancelling}
              className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              {cancelling && <Loader2 size={12} className="animate-spin" />}
              Yes, cancel
            </button>
            <span className="text-muted-foreground/40">/</span>
            <button
              onClick={() => setConfirmCancel(false)}
              className="text-xs font-semibold text-muted-foreground hover:underline"
            >
              Keep it
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmCancel(true)}
            disabled={busy}
            className="w-fit px-4 py-2 border border-border text-muted-foreground text-xs font-bold rounded-sm hover:border-destructive hover:text-destructive transition-colors disabled:opacity-50"
          >
            Cancel pay-as-you-go billing
          </button>
        )
      )}
    </div>
  );
}
