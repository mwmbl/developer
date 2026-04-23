"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { GitFork, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Nav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between px-6 py-4 border-b border-border/50 max-w-6xl mx-auto w-full"
    >
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo.svg"
          alt="Mwmbl logo"
          width={36}
          height={36}
          loading="eager"
          className="rounded-lg"
        />
        <span className="font-bold text-lg tracking-tight">
          <span className="text-accent-text">developer.</span>mwmbl.org
        </span>
      </Link>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link
          href="/pricing"
          className={`hover:text-foreground transition-colors ${
            pathname === "/pricing" ? "text-foreground" : ""
          }`}
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
    </motion.nav>
  );
}
