"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export interface PricingTier {
  name: string;
  price: string;
  priceNote?: string;
  requests: string;
  rateLimit: string;
  apiKey: string;
  features: string[];
  cta: string;
  ctaHref: string;
  ctaExternal?: boolean;
  highlighted?: boolean;
  badge?: string;
  muted?: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
  index: number;
  onCtaClick?: () => void;
  ctaLoading?: boolean;
}

export function PricingCard({ tier, index, onCtaClick, ctaLoading }: PricingCardProps) {
  const borderClass = tier.highlighted
    ? "border-accent-text"
    : "border-border";

  const ctaClass = tier.highlighted
    ? "bg-accent-text text-background hover:opacity-90"
    : tier.muted
    ? "border border-border text-muted-foreground hover:border-accent-text hover:text-accent-text"
    : "bg-primary text-primary-foreground hover:opacity-90";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: "easeOut" }}
      className={`relative flex flex-col border ${borderClass} bg-card rounded-sm p-6 gap-5`}
    >
      {/* Badge */}
      {tier.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-accent-text text-background text-xs font-bold rounded-sm tracking-wide">
          {tier.badge}
        </span>
      )}

      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
          {tier.name}
        </p>
        <div className="flex items-baseline gap-1">
          <span
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
          >
            {tier.price}
          </span>
          {tier.priceNote && (
            <span className="text-xs text-muted-foreground">{tier.priceNote}</span>
          )}
        </div>
      </div>

      {/* Key stats */}
      <div className="flex flex-col gap-2 text-sm border-t border-border pt-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Requests / month</span>
          <span className="font-semibold text-foreground font-mono">{tier.requests}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rate limit</span>
          <span className="font-semibold text-foreground font-mono">{tier.rateLimit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">API key</span>
          <span className="font-semibold text-foreground font-mono">{tier.apiKey}</span>
        </div>
      </div>

      {/* Feature list */}
      <ul className="flex flex-col gap-2 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check size={14} className="text-accent-text mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {onCtaClick ? (
        <button
          onClick={onCtaClick}
          disabled={ctaLoading}
          className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-sm transition-opacity disabled:opacity-50 ${ctaClass}`}
        >
          {ctaLoading && <Loader2 size={13} className="animate-spin" />}
          {tier.cta}
        </button>
      ) : tier.ctaExternal ? (
        <a
          href={tier.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full text-center py-2.5 text-xs font-bold rounded-sm transition-opacity ${ctaClass}`}
        >
          {tier.cta}
        </a>
      ) : (
        <Link
          href={tier.ctaHref}
          className={`w-full text-center py-2.5 text-xs font-bold rounded-sm transition-all ${ctaClass}`}
        >
          {tier.cta}
        </Link>
      )}
    </motion.div>
  );
}
