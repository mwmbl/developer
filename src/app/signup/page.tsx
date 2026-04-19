"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Check, Loader2 } from "lucide-react";
import { register, ApiError } from "@/lib/api";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const VALUE_PROPS = [
  "1,000 free requests/month — no sign-up required",
  "2,000 requests/month free with an account",
  "Up to 50,000 requests/month on paid plans",
  "Open-source, ethical, community-built index",
  "Fast global search — under 200 ms typical latency",
  "No tracking, no ads, no lock-in",
];

function SignUpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plan");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await register(email, password);
      setSubmitted(true);
      if (plan) {
        router.push(`/signin?plan=${plan}`);
      }
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
          Account created!
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Check your inbox to verify your email address, then sign in
          to retrieve your API key.
        </p>
        <Link
          href="/"
          className="mt-2 text-xs font-semibold text-accent-text hover:underline"
        >
          ← Back to the demo
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
          Create your account
        </h2>
        <p className="text-xs text-muted-foreground">
          Free forever. No credit card required.
        </p>
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-border bg-muted/30 hover:border-accent-text hover:text-accent-text text-sm font-semibold rounded-sm transition-colors"
      >
        <GithubIcon size={16} />
        Continue with GitHub
      </button>

      <div className="flex items-center gap-3">
        <span className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground/60">or continue with email</span>
        <span className="flex-1 h-px bg-border" />
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

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="password">
            Password
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
            Confirm password
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
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground/60">
        Already have an account?{" "}
        <Link href="/signin" className="text-accent-text hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function SignUpPage() {
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
                Create a free account to get your API key and start integrating
                Mwmbl search into your project today.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {VALUE_PROPS.map((prop) => (
                <li key={prop} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check size={14} className="text-accent-text mt-0.5 shrink-0" />
                  {prop}
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground/50">
              Need more?{" "}
              <Link href="/pricing" className="text-accent-text hover:underline">
                View all pricing plans →
              </Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <div className="border border-border bg-card rounded-sm p-8 flex flex-col gap-6">
              <Suspense fallback={<Loader2 className="animate-spin mx-auto" />}>
                <SignUpForm />
              </Suspense>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
