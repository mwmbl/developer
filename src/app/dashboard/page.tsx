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
  createCheckout, ApiError, Subscription, ApiKey,
} from "@/lib/api";

const PLAN_BADGE: Record<string, string> = {
  anonymous: "bg-muted text-muted-foreground",
  free: "bg-muted text-muted-foreground",
  starter: "bg-accent-text/15 text-accent-text",
  pro: "bg-accent-text/25 text-accent-text",
  enterprise: "bg-primary/20 text-primary-foreground",
};

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
        {sub.current_period_end && (
          <p className="text-xs text-muted-foreground">
            Resets {new Date(sub.current_period_end).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </div>
    </div>
  );
}

function UpgradeBanner({ onCheckout }: { onCheckout: (plan: "starter" | "pro") => Promise<void> }) {
  const [loading, setLoading] = useState<"starter" | "pro" | null>(null);

  const handleClick = async (plan: "starter" | "pro") => {
    setLoading(plan);
    try {
      await onCheckout(plan);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="border border-border bg-card rounded-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground mb-1">Upgrade your plan</p>
        <p className="text-xs text-muted-foreground">
          Get more requests per month and unlock higher rate limits.
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => void handleClick("starter")}
          disabled={loading !== null}
          className="px-4 py-2 border border-accent-text text-accent-text text-xs font-bold rounded-sm hover:bg-accent-text hover:text-background transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading === "starter" && <Loader2 size={12} className="animate-spin" />}
          Starter — $10/mo
        </button>
        <button
          onClick={() => void handleClick("pro")}
          disabled={loading !== null}
          className="px-4 py-2 bg-accent-text text-background text-xs font-bold rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading === "pro" && <Loader2 size={12} className="animate-spin" />}
          Pro — $25/mo
        </button>
      </div>
    </div>
  );
}

function ApiKeysSection() {
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
          className="flex-1 bg-transparent border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent-text transition-colors font-mono"
        />
        <button
          type="submit"
          disabled={creating}
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
                    Created {new Date(k.created_at).toLocaleDateString()}
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
  const { user, loading, signOut, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "true";

  const [sub, setSub] = useState<Subscription | null>(null);
  const [subError, setSubError] = useState<string | null>(null);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(upgraded);

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
    if (upgraded) {
      void refreshUser();
    }
  }, [upgraded, refreshUser]);

  const handleCheckout = useCallback(async (plan: "starter" | "pro") => {
    const { checkout_url } = await createCheckout(plan);
    window.location.href = checkout_url;
  }, []);

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 flex flex-col gap-6">

      {/* Upgrade success banner */}
      <AnimatePresence>
        {showUpgradeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-accent-text/30 bg-accent-text/10 rounded-sm px-5 py-3 flex items-center justify-between gap-3"
          >
            <p className="text-sm text-accent-text font-medium">
              Your plan has been upgraded! It may take a moment to reflect.
            </p>
            <button onClick={() => setShowUpgradeBanner(false)}>
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
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wide ${PLAN_BADGE[user.plan] ?? PLAN_BADGE.free}`}>
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

      {/* Upgrade banner for free users */}
      {user.plan === "free" && (
        <UpgradeBanner onCheckout={handleCheckout} />
      )}

      {/* API Keys */}
      <ApiKeysSection />
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
