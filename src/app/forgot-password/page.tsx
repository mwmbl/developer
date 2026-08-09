"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Check, Loader2 } from "lucide-react";
import { forgotPassword, ApiError } from "@/lib/api";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
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
          Check your inbox
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          If an account exists for that email address, we&apos;ve sent a link
          to reset your password.
        </p>
        <Link
          href="/signin"
          className="mt-2 text-xs font-semibold text-accent-text hover:underline"
        >
          ← Back to sign in
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
          Reset your password
        </h2>
        <p className="text-xs text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
              Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground/60">
        Remembered your password?{" "}
        <Link href="/signin" className="text-accent-text hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-8"
          >
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Mwmbl logo" width={44} height={44} className="rounded-lg" />
              <span className="font-bold text-xl tracking-tight">
                <span className="text-accent-text">api.</span>mwmbl
              </span>
            </div>

            <div>
              <h1
                className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-3"
                style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
              >
                Search the ethical web.
                <br />
                <span className="text-accent-text">Build something good.</span>
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                We&apos;ll email you a link to get back into your account.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <div className="border border-border bg-card rounded-sm p-8 flex flex-col gap-6">
              <Suspense fallback={<Loader2 className="animate-spin mx-auto" />}>
                <ForgotPasswordForm />
              </Suspense>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
