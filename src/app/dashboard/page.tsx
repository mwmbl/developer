"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import {
  Loader2, Trash2, Copy, Check, X, Plus, Key, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getSubscription, listApiKeys, createApiKey, deleteApiKey,
  createCheckout, cancelSubscription, uncancelSubscription, updateSpendLimit,
  ApiError, Subscription, ApiKey,
} from "@/lib/api";
import { SPEND_LIMIT_PRESETS_CENTS, formatUsd } from "@/lib/pricing";
import Link from "next/link";

const PLAN_BADGE: Record<string, string> = {
  anonymous: "bg-muted text-muted-foreground",
  free: "bg-muted text-muted-foreground",
};
const FALLBACK_PLAN_BADGE = "bg-accent-text/15 text-accent-text";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded-sm border border-border hover:border-accent-text transition-colors text-muted-foreground hover:text-accent-text"
      title="Copy"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Check size={13} className="text-accent-text" />
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Copy size={13} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function UsageCard({ sub }: { sub: Subscription }) {
  const pct = sub.monthly_limit > 0
    ? Math.min(100, (sub.monthly_usage / sub.monthly_limit) * 100)
    : 0;
  return (
    <div className="border border-border bg-card rounded-sm p-6 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-foreground">Usage this month</h2>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Requests</span>
          <span className="font-mono text-foreground">
            {sub.monthly_usage.toLocaleString()} / {sub.monthly_limit.toLocaleString()}
          </span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-text rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {sub.max_monthly_spend_cents > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated bill this period</span>
            <span className="font-mono text-foreground">
              {formatUsd(sub.estimated_cost_cents)} / {formatUsd(sub.max_monthly_spend_cents)} cap
            </span>
          </div>
        )}
        {sub.current_period_end && (
          <p className="text-xs text-muted-foreground">
            Resets {new Date(sub.current_period_end).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </div>
    </div>
  );
}

function SpendLimitCard({ sub, canUpgrade, onUpdate }: { sub: Subscription; canUpgrade: boolean; onUpdate: (sub: Subscription) => void }) {
  // Cap and cancellation state are tracked optimistically — API responses still
  // reflect pre-webhook state, so we can't rely on sub.status directly right after a change.
  const [currentCapCents, setCurrentCapCents] = useState(sub.max_monthly_spend_cents);
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
      setCurrentCapCents(cents);
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

  return (
    <div className="border border-border bg-card rounded-sm p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Pay-as-you-go billing</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {currentCapCents > 0
              ? `Beyond your free 2,000 requests, usage is billed at $5 per 1,000 requests, up to a $${(currentCapCents / 100).toFixed(0)} monthly cap.`
              : "You're on the free tier — 2,000 requests/month, hard-capped. Set a spend cap to unlock more."}
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
          your account returns to the free 2,000 req/month limit.
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

function ApiKeysSection({ canCreate }: { canCreate: boolean }) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);
  const [keysError, setKeysError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    listApiKeys()
      .then(setKeys)
      .catch((err) => setKeysError(err instanceof ApiError ? err.message : "Failed to load API keys."))
      .finally(() => setKeysLoading(false));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const created = await createApiKey(newKeyName.trim());
      setNewKey(created);
      setKeys((prev) => [created, ...prev]);
      setNewKeyName("");
    } catch (err) {
      setKeysError(err instanceof ApiError ? err.message : "Failed to create API key.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    setRevoking(keyId);
    try {
      await deleteApiKey(keyId);
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      if (newKey?.id === keyId) setNewKey(null);
    } catch (err) {
      setKeysError(err instanceof ApiError ? err.message : "Failed to revoke API key.");
    } finally {
      setRevoking(null);
      setConfirmRevoke(null);
    }
  };

  return (
    <div className="border border-border bg-card rounded-sm p-6 flex flex-col gap-5">
      <h2 className="text-sm font-semibold text-foreground">API Keys</h2>

      {keysError && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle size={13} />
          {keysError}
        </div>
      )}

      {/* New key reveal */}
      <AnimatePresence>
        {newKey?.key && (
          <motion.div
            key={newKey.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-accent-text/30 bg-accent-text/5 rounded-sm p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <Key size={13} className="text-accent-text shrink-0" />
              <span className="text-xs font-semibold text-accent-text">Your new API key</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs text-foreground bg-background border border-border rounded-sm px-3 py-2 break-all">
                {newKey.key}
              </code>
              <CopyButton text={newKey.key} />
            </div>
            <p className="text-xs text-muted-foreground">
              Store this key securely — it won&apos;t be shown again.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create form */}
      <form
        onSubmit={(e) => { e.preventDefault(); void handleCreate(); }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="Key name (optional)"
          disabled={!canCreate}
          className="flex-1 bg-transparent border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent-text transition-colors font-mono disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={creating || !canCreate}
          title={!canCreate ? "Accept the Terms of Service to create API keys" : undefined}
          className="px-4 py-2 bg-accent-text text-background text-xs font-bold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Create
        </button>
      </form>

      {/* Key list */}
      {keysLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : keys.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No API keys yet. Create one above.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {keys.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between gap-3 border border-border rounded-sm px-4 py-3"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm text-foreground font-medium truncate">
                  {k.name || "Unnamed key"}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-mono">
                    Created {new Date(k.created_on).toLocaleDateString()}
                  </span>
                  {k.scopes.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 bg-muted rounded-sm text-xs text-muted-foreground font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {confirmRevoke === k.id ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground">Revoke?</span>
                  <button
                    onClick={() => void handleRevoke(k.id)}
                    disabled={revoking === k.id}
                    className="text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                  >
                    {revoking === k.id ? <Loader2 size={12} className="animate-spin" /> : "Yes"}
                  </button>
                  <span className="text-muted-foreground/40">/</span>
                  <button
                    onClick={() => setConfirmRevoke(null)}
                    className="text-xs font-semibold text-muted-foreground hover:underline"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRevoke(k.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Revoke key"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DashboardContent() {
  const { user, loading, signOut, refreshUser, hasAgreedToTerms } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const billing = searchParams.get("billing") === "true";
  const pendingCapCentsParam = searchParams.get("pendingCapCents");
  const pendingCapCents = pendingCapCentsParam ? Number(pendingCapCentsParam) : null;

  const [sub, setSub] = useState<Subscription | null>(null);
  const [subError, setSubError] = useState<string | null>(null);
  const [showBillingBanner, setShowBillingBanner] = useState(billing);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin?next=/dashboard");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    getSubscription()
      .then(setSub)
      .catch((err) => setSubError(err instanceof ApiError ? err.message : "Failed to load subscription."));
  }, [user]);

  useEffect(() => {
    if (!billing) return;
    let cancelled = false;
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const latest = await getSubscription();
        if (cancelled) return;
        setSub(latest);
        if (latest.polar_customer_id !== null) {
          clearInterval(poll);
          if (pendingCapCents !== null) {
            try {
              const updated = await updateSpendLimit(pendingCapCents);
              if (!cancelled) setSub(updated);
            } catch {
              // Leave the cap unset — the user can set it manually from the dashboard.
            }
          }
          void refreshUser();
          router.replace("/dashboard");
        } else if (attempts >= 10) {
          clearInterval(poll);
        }
      } catch {
        if (attempts >= 10) clearInterval(poll);
      }
    }, 2000);
    return () => { cancelled = true; clearInterval(poll); };
  }, [billing, pendingCapCents, refreshUser, router]);

  const handleUpdateSub = useCallback((updated: Subscription) => {
    setSub(updated);
    void refreshUser();
  }, [refreshUser]);

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 flex flex-col gap-6">

      {/* Billing setup success banner */}
      <AnimatePresence>
        {showBillingBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-accent-text/30 bg-accent-text/10 rounded-sm px-5 py-3 flex items-center justify-between gap-3"
          >
            <p className="text-sm text-accent-text font-medium">
              Billing is set up! It may take a moment to reflect.
            </p>
            <button onClick={() => setShowBillingBanner(false)}>
              <X size={15} className="text-accent-text/60 hover:text-accent-text" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent-text/15 flex items-center justify-center text-sm font-bold text-accent-text uppercase">
            {user.email[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{user.email}</p>
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wide ${PLAN_BADGE[user.plan] ?? FALLBACK_PLAN_BADGE}`}>
              {user.plan}
            </span>
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Subscription card */}
      {subError ? (
        <div className="flex items-center gap-2 text-xs text-destructive border border-destructive/30 bg-destructive/5 rounded-sm px-4 py-3">
          <AlertCircle size={13} />
          {subError}
        </div>
      ) : sub ? (
        <UsageCard sub={sub} />
      ) : (
        <div className="border border-border bg-card rounded-sm p-6 flex justify-center">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Terms of service banner */}
      {!hasAgreedToTerms && (
        <div className="border border-amber-500/30 bg-amber-500/10 rounded-sm px-5 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
            Accept our Terms of Service to create API keys or turn on pay-as-you-go billing.
          </p>
          <Link
            href="/agree?next=/dashboard"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
          >
            Accept Terms →
          </Link>
        </div>
      )}

      {/* Spend cap management */}
      {sub && (
        <SpendLimitCard sub={sub} canUpgrade={hasAgreedToTerms} onUpdate={handleUpdateSub} />
      )}

      {/* API Keys */}
      <ApiKeysSection canCreate={hasAgreedToTerms} />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
      <Footer />
    </div>
  );
}
