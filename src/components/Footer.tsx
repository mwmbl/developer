export function Footer() {
  return (
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
  );
}
