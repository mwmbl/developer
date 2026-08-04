"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GitFork, ExternalLink, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

export function Nav() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <div className="relative border-b border-border/50">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full"
      >
        <Link href="/" className="flex items-center gap-3" onClick={close}>
          <Image
            src="/logo.svg"
            alt="Mwmbl logo"
            width={36}
            height={36}
            loading="eager"
            className="rounded-lg"
          />
          <span className="hidden min-[380px]:inline font-bold text-lg tracking-tight">
            <span className="text-accent-text">developer.</span>mwmbl.org
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="/#pricing"
            className="hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
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
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 bg-accent-text text-background text-xs font-semibold rounded-sm hover:opacity-90 transition-opacity"
              >
                Dashboard
              </Link>
              <span className="w-7 h-7 rounded-full bg-accent-text/15 flex items-center justify-center text-xs font-bold text-accent-text uppercase">
                {user.email[0]}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="px-3 py-1.5 border border-border text-muted-foreground text-xs font-semibold rounded-sm hover:border-accent-text hover:text-accent-text transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 bg-accent-text text-background text-xs font-semibold rounded-sm hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="sm:hidden absolute top-full left-0 right-0 z-50 border-b border-border bg-background px-6 py-4 flex flex-col gap-4 text-sm text-muted-foreground"
          >
            <Link
              href="/#pricing"
              onClick={close}
              className="hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <a
              href="https://mwmbl.org"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              Docs <ExternalLink size={12} />
            </a>
            <a
              href="https://github.com/mwmbl/mwmbl"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <GitFork size={15} />
              GitHub
            </a>
            <a
              href="https://api.mwmbl.org/api/v1/search/docs"
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="self-start px-3 py-1.5 border border-accent-text text-accent-text text-xs font-semibold rounded-sm hover:bg-accent-text hover:text-background transition-colors"
            >
              API Reference
            </a>
            {user ? (
              <Link
                href="/dashboard"
                onClick={close}
                className="self-start px-3 py-1.5 bg-accent-text text-background text-xs font-semibold rounded-sm hover:opacity-90 transition-opacity"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  onClick={close}
                  className="px-3 py-1.5 border border-border text-muted-foreground text-xs font-semibold rounded-sm hover:border-accent-text hover:text-accent-text transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={close}
                  className="px-3 py-1.5 bg-accent-text text-background text-xs font-semibold rounded-sm hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
