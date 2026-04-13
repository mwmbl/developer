"use client";

import { motion } from "framer-motion";
import { TypingHero } from "@/components/TypingHero";
import { ApiDemo } from "@/components/ApiDemo";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

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
      <section id="demo" className="flex-1 pb-20 px-4">
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

      <Footer />
    </div>
  );
}
