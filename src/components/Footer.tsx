import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-6 px-6 text-xs text-muted-foreground/50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
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
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-muted-foreground transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-muted-foreground transition-colors">
            Privacy
          </Link>
          <span className="font-mono">
            <span className="text-accent-text">$</span> curl api.mwmbl.org/api/v1/search
          </span>
        </div>
      </div>
    </footer>
  );
}
