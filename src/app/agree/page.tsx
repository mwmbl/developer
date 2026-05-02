"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Loader2, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

function AgreeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, acceptTerms, signOut } = useAuth();
  const next = searchParams.get("next") ?? "/dashboard";

  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    router.replace("/signin");
    return null;
  }

  const handleAccept = async () => {
    if (!checked) return;
    setError(null);
    setSubmitting(true);
    try {
      await acceptTerms();
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = () => {
    signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-accent-text/10 flex items-center justify-center shrink-0">
          <FileText size={18} className="text-accent-text" />
        </span>
        <div>
          <h2
            className="text-xl font-semibold text-foreground"
            style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
          >
            Terms of Service
          </h2>
          <p className="text-xs text-muted-foreground">
            Please review and accept before continuing.
          </p>
        </div>
      </div>

      <div className="border border-border rounded-sm p-4 flex flex-col gap-3 text-xs text-muted-foreground leading-relaxed bg-muted/20">
        <p>
          By using the Mwmbl Search API you agree to use it only for lawful purposes,
          respect rate limits and fair-use quotas, and not attempt to scrape, cache,
          or redistribute the index in bulk.
        </p>
        <p>
          The API is provided as-is. Mwmbl reserves the right to suspend access for
          abuse or violation of these terms.
        </p>
        <Link href="/terms" target="_blank" className="text-accent-text hover:underline font-medium">
          Read the full Terms of Service →
        </Link>
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 shrink-0 accent-[var(--accent-text)]"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I have read and agree to the Mwmbl{" "}
          <Link href="/terms" target="_blank" className="text-accent-text hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="text-accent-text hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex flex-col gap-2">
        <button
          onClick={() => void handleAccept()}
          disabled={!checked || submitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving…
            </>
          ) : (
            "Accept and continue"
          )}
        </button>
        <button
          onClick={handleDecline}
          disabled={submitting}
          className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Decline and sign out
        </button>
      </div>
    </div>
  );
}

export default function AgreePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md border border-border bg-card rounded-sm p-8"
        >
          <Suspense fallback={<Loader2 className="animate-spin mx-auto" />}>
            <AgreeForm />
          </Suspense>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
