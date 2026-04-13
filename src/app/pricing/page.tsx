"use client";

import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PricingCard, PricingTier } from "@/components/PricingCard";
import Link from "next/link";

const TIERS: PricingTier[] = [
  {
    name: "Anonymous",
    price: "Free",
    requests: "1,000",
    rateLimit: "1 req/s",
    apiKey: "Not required",
    features: [
      "No sign-up needed — try the API instantly",
      "Tied to your IP address",
      "Perfect for quick experiments and demos",
    ],
    cta: "Try it now",
    ctaHref: "/#demo",
    muted: true,
  },
  {
    name: "Free",
    price: "Free",
    requests: "2,000",
    rateLimit: "5 req/s",
    apiKey: "Required",
    features: [
      "API key for reliable, identified access",
      "2× the anonymous quota",
      "Great for personal projects and prototypes",
    ],
    cta: "Get started",
    ctaHref: "/signup",
  },
  {
    name: "Starter",
    price: "$10",
    priceNote: "/ month",
    requests: "10,000",
    rateLimit: "5 req/s",
    apiKey: "Required",
    features: [
      "5× the free quota",
      "Ideal for small production apps",
      "Cancel any time — no commitment",
    ],
    cta: "Sign up",
    ctaHref: "/signup",
  },
  {
    name: "Pro",
    price: "$25",
    priceNote: "/ month",
    requests: "50,000",
    rateLimit: "5 req/s",
    apiKey: "Required",
    features: [
      "25× the free quota",
      "Built for growing products",
      "Priority support",
    ],
    cta: "Sign up",
    ctaHref: "/signup",
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    requests: "Unlimited",
    rateLimit: "Custom",
    apiKey: "Required",
    features: [
      "Volume pricing tailored to your needs",
      "Custom rate limits",
      "Dedicated support & SLA",
    ],
    cta: "Get in touch",
    ctaHref: "mailto:hello@mwmbl.org",
    ctaExternal: true,
    muted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center pt-20 pb-12 px-4 relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full bg-brand-gradient opacity-[0.06] blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center relative z-10"
        >
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground mb-4"
            style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
          >
            Simple, transparent pricing
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Start for free — no credit card, no sign-up required. Upgrade when
            you need more.{" "}
            <span className="text-foreground font-semibold">
              All plans share the same fast, ethical search index.
            </span>
          </p>
        </motion.div>
      </section>

      {/* Anonymous tier callout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="max-w-6xl mx-auto w-full px-4 mb-6"
      >
        <div className="border border-border bg-muted/20 rounded-sm px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            <span className="text-accent-text font-semibold">Anonymous access</span>
            {" "}— the demo on our homepage uses this tier. No sign-up needed, but limited to{" "}
            <span className="font-mono text-foreground">1,000 req/month</span> at{" "}
            <span className="font-mono text-foreground">1 req/s</span>, tied to your IP address.
          </span>
          <Link
            href="/#demo"
            className="shrink-0 text-xs font-semibold text-accent-text hover:underline"
          >
            Try the demo →
          </Link>
        </div>
      </motion.div>

      {/* Pricing grid */}
      <section className="flex-1 pb-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {TIERS.map((tier, i) => (
            <PricingCard key={tier.name} tier={tier} index={i} />
          ))}
        </div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-xs text-muted-foreground/60 mt-10"
        >
          All paid plans are billed monthly. No long-term commitment — cancel any time.
          Quotas reset on the first of each month.
        </motion.p>
      </section>

      {/* FAQ strip */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-border/50 py-12 px-6"
      >
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[
            {
              q: "Do I need a credit card to sign up?",
              a: "No. The Free tier requires only an email address. You only need payment details when upgrading to a paid plan.",
            },
            {
              q: "What happens if I exceed my quota?",
              a: "Requests beyond your monthly quota will return a 429 response. You can upgrade at any time to increase your limit.",
            },
            {
              q: "Is the API key shared across plans?",
              a: "Yes — your API key stays the same when you upgrade or downgrade. Just pass it as the `api_key` query parameter.",
            },
            {
              q: "What is the anonymous tier?",
              a: "You can call the API without a key, limited to 1,000 requests per month at 1 req/s, identified by IP. Great for quick tests.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-foreground">{q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
