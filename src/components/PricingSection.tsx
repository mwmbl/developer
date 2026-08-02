"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PricingCard, PricingTier } from "@/components/PricingCard";
import { useAuth } from "@/lib/auth-context";

export const TIERS: PricingTier[] = [
  {
    name: "Anonymous",
    price: "Free",
    stats: [
      { label: "Requests / month", value: "1,000" },
      { label: "Rate limit", value: "1 req/s" },
      { label: "API key", value: "Not required" },
    ],
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
    stats: [
      { label: "Requests / month", value: "2,000" },
      { label: "Rate limit", value: "5 req/s" },
      { label: "API key", value: "Required" },
    ],
    features: [
      "API key for reliable, identified access",
      "Hard-capped at 2,000 req/month unless you turn on pay-as-you-go",
      "Great for personal projects and prototypes",
    ],
    cta: "Get started",
    ctaHref: "/signup",
  },
  {
    name: "Pay as you go",
    price: "$5",
    priceNote: "/ 1,000 requests",
    stats: [
      { label: "Free requests", value: "2,000 / mo" },
      { label: "Rate limit", value: "5 req/s" },
      { label: "API key", value: "Required" },
    ],
    features: [
      "Beyond your free 2,000, pay only for what you use",
      "Set your own monthly spend cap — never get a surprise bill",
      "No fixed tiers: scale smoothly as you grow",
    ],
    cta: "Sign up",
    ctaHref: "/signup",
    highlighted: true,
    badge: "Pay for what you use",
  },
  {
    name: "Enterprise",
    price: "Custom",
    stats: [
      { label: "Requests / month", value: "Unlimited" },
      { label: "Rate limit", value: "Custom" },
      { label: "API key", value: "Required" },
    ],
    features: [
      "Custom SLA & uptime commitments",
      "Dedicated support & onboarding",
      "Invoicing instead of card billing",
    ],
    cta: "Get in touch",
    ctaHref: "mailto:hello@mwmbl.org",
    ctaExternal: true,
    muted: true,
  },
];

export function PricingSection() {
  const { user } = useAuth();

  const tiers = TIERS.map((tier) => {
    if (tier.name === "Pay as you go" && user) {
      return { ...tier, cta: "Manage in dashboard", ctaHref: "/dashboard" };
    }
    return tier;
  });

  return (
    <>
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier, i) => (
            <PricingCard key={tier.name} tier={tier} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center text-xs text-muted-foreground/60 mt-10"
        >
          Pay-as-you-go usage is billed monthly in arrears. No long-term commitment —
          change or cancel your spend cap any time. Quotas reset on the first of each month.
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
              a: "No. The Free tier requires only an email address. You only need payment details when you turn on pay-as-you-go billing.",
            },
            {
              q: "How does the $5 per 1,000 requests billing work?",
              a: "Beyond your free 2,000 requests/month, usage is metered at $5 per 1,000 requests and billed monthly. You set a spend cap so you're never surprised by a bill — change or remove it any time from your dashboard.",
            },
            {
              q: "What happens if I exceed my quota?",
              a: "On the free tier, requests beyond 2,000/month return a 429. If you've turned on pay-as-you-go, usage beyond the free 2,000 is billed until you hit your spend cap — after that, requests return 429 until your quota resets.",
            },
            {
              q: "Is my API key affected when I turn on pay-as-you-go?",
              a: "No — your API key stays the same. Just pass it as the `api_key` query parameter, same as before.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-foreground">{q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </>
  );
}
