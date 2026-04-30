"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createCheckout, ApiError } from "@/lib/api";

function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();
  const plan = searchParams.get("plan") as "starter" | "pro" | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { hasAgreedToTerms: agreed } = await signIn(email, password);
      if (!agreed) {
        const next = plan ? `/signin?plan=${plan}` : "/dashboard";
        router.push(`/agree?next=${encodeURIComponent(next)}`);
        return;
      }
      if (plan === "starter" || plan === "pro") {
        try {
          const { checkout_url } = await createCheckout(plan);
          window.location.href = checkout_url;
        } catch {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h2
          className="text-xl font-semibold text-foreground mb-1"
          style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
        >
          Sign in to your account
        </h2>
        <p className="text-xs text-muted-foreground">
          Welcome back.
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

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground" htmlFor="password">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-accent-text hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
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
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground/60">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent-text hover:underline">
          Sign up free
        </Link>
      </p>
    </>
  );
}

export default function SignInPage() {
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
                Sign in to manage your API key, view usage, and upgrade your plan.
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
                <SignInForm />
              </Suspense>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
