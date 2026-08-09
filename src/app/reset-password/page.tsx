"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Check, Loader2, XCircle } from "lucide-react";
import { resetPassword, ApiError } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const key = searchParams.get("key");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!email || !key) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle size={24} className="text-destructive" />
        </span>
        <h2
          className="text-xl font-semibold text-foreground"
          style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
        >
          Invalid link
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          This password reset link is invalid. Please request a new one.
        </p>
        <Link href="/forgot-password" className="mt-2 text-xs font-semibold text-accent-text hover:underline">
          Back to forgot password
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, key, password);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-8 text-center"
      >
        <span className="w-12 h-12 rounded-full bg-accent-text/10 flex items-center justify-center">
          <Check size={24} className="text-accent-text" />
        </span>
        <h2
          className="text-xl font-semibold text-foreground"
          style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
        >
          Password reset!
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your password has been updated. You can now sign in with your new
          password.
        </p>
        <Link
          href="/signin"
          className="mt-2 px-5 py-2.5 bg-accent-text text-background text-xs font-bold rounded-sm hover:opacity-90 transition-opacity"
        >
          Sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <div>
        <h2
          className="text-xl font-semibold text-foreground mb-1"
          style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
        >
          Set a new password
        </h2>
        <p className="text-xs text-muted-foreground">
          Choose a new password for {email}.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent-text transition-colors font-mono"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="confirm">
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            className="w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent-text transition-colors font-mono"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Resetting…
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="border border-border bg-card rounded-sm p-8 flex flex-col gap-6">
            <Suspense fallback={
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-accent-text" />
              </div>
            }>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
