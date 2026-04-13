"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TypingHero } from "@/components/TypingHero";
import { ApiDemo } from "@/components/ApiDemo";
import { GitFork, ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between px-6 py-4 border-b border-border/50 max-w-6xl mx-auto w-full"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Mwmbl logo"
            width={36}
            height={36}
            loading="eager"
            className="rounded-lg"
          />
          <span className="font-bold text-lg tracking-tight">
            <span className="text-accent-text">api.</span>mwmbl
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href="https://mwmbl.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            Docs <ExternalLink size={12} />
          </a>
          <a
            href="https://github.com/mwmbl/mwmbl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <GitFork size={15} />
            GitHub
          </a>
          <a
            href="https://api.mwmbl.org/api/v1/search/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 border border-accent-text text-accent-text text-xs font-semibold rounded-sm hover:bg-accent-text hover:text-background transition-colors"
          >
            API Reference
          </a>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center pt-20 pb-16 px-4 relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-brand-gradient opacity-[0.06] blur-3xl pointer-events-none" />

        <TypingHero />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 text-base sm:text-lg text-muted-foreground max-w-xl text-center leading-relaxed"
        >
          The Mwmbl web search API provides a{" "}
          <span className="text-foreground font-semibold">generous free tier</span>{" "}
          — try it out:
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-10 flex flex-col items-center gap-1 text-muted-foreground/40 text-xs"
        >
          <span>↓</span>
        </motion.div>
      </section>

      {/* ── API Demo ─────────────────────────────────────────────────── */}
      <section className="flex-1 pb-20 px-4">
        <ApiDemo />
      </section>

      {/* ── Features strip ───────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-border/50 py-12 px-6"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            {
              label: "Free tier",
              value: "Unlimited",
              desc: "No API key required to get started",
            },
            {
              label: "Latency",
              value: "< 200ms",
              desc: "Fast, globally distributed search index",
            },
            {
              label: "License",
              value: "Open Source",
              desc: "AGPL-3.0 — inspect, fork, contribute",
            },
          ].map(({ label, value, desc }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">
                {label}
              </span>
              <span className="text-2xl font-bold text-accent-text">{value}</span>
              <span className="text-sm text-muted-foreground">{desc}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-6 px-6 text-center text-xs text-muted-foreground/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Built by the{" "}
            <a
              href="https://mwmbl.org"
              className="text-accent-text hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mwmbl community
            </a>{" "}
            — search that puts people first.
          </span>
          <span className="font-mono">
            <span className="text-accent-text">$</span> curl
            api.mwmbl.org/api/v1/search
          </span>
        </div>
      </footer>
    </div>
  );
}
