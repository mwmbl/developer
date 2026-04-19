"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Check, Loader2, XCircle } from "lucide-react";
import { confirmEmail, ApiError } from "@/lib/api";

type Status = "loading" | "success" | "error" | "invalid";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const key = searchParams.get("key");

  const [status, setStatus] = useState<Status>(() =>
    email && key ? "loading" : "invalid"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!email || !key) return;
    confirmEmail(email, key)
      .then(() => setStatus("success"))
      .catch((err) => {
        setErrorMessage(err instanceof ApiError ? err.message : "Confirmation failed. Please try again.");
        setStatus("error");
      });
  }, [email, key]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Loader2 size={32} className="animate-spin text-accent-text" />
        <p className="text-sm text-muted-foreground">Confirming your email…</p>
      </div>
    );
  }

  if (status === "success") {
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
          Email confirmed!
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your email address has been verified. You can now sign in to access your API key.
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

  if (status === "invalid") {
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
          This confirmation link is invalid. Please check your email or sign up again.
        </p>
        <Link href="/signup" className="mt-2 text-xs font-semibold text-accent-text hover:underline">
          Back to sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <span className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <XCircle size={24} className="text-destructive" />
      </span>
      <h2
        className="text-xl font-semibold text-foreground"
        style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
      >
        Confirmation failed
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        {errorMessage ?? "Something went wrong. Please try again."}
      </p>
      <Link href="/signup" className="mt-2 text-xs font-semibold text-accent-text hover:underline">
        Back to sign up
      </Link>
    </div>
  );
}

export default function ConfirmEmailPage() {
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
          <div className="border border-border bg-card rounded-sm p-8">
            <Suspense fallback={
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-accent-text" />
              </div>
            }>
              <ConfirmEmailContent />
            </Suspense>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
