"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Copy, Check, Loader2 } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface SearchResult {
  url: string;
  title: string;
  extract: string;
}

type Tab = "curl" | "python" | "js";

// ── Snippet generators ─────────────────────────────────────────────────────

function getCurlSnippet(query: string) {
  return `curl "https://api.mwmbl.org/api/v1/search/?s=${encodeURIComponent(query)}"`;
}

function getPythonSnippet(query: string) {
  return `import requests

response = requests.get(
    "https://api.mwmbl.org/api/v1/search/?s=${query}"
)
results = response.json()
for r in results:
    print(r["title"], r["url"])`;
}

function getJsSnippet(query: string) {
  return `const params = new URLSearchParams({ s: "${query}" });
const res = await fetch(
  \`https://api.mwmbl.org/api/v1/search/?\${params}\`
);
const results = await res.json();
results.forEach(({ title, url }) => console.log(title, url));`;
}

// ── JSON syntax highlighter ────────────────────────────────────────────────

function highlightJson(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-chart-3"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-accent-text"; // key
          } else {
            cls = "text-chart-2"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-chart-5"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-muted-foreground"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded border border-border hover:border-accent-text hover:text-accent-text transition-colors text-muted-foreground"
      title="Copy to clipboard"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Check size={14} className="text-green-400" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Copy size={14} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

const TAB_LABELS: { id: Tab; label: string }[] = [
  { id: "curl", label: "cURL" },
  { id: "python", label: "Python" },
  { id: "js", label: "JavaScript" },
];

// ── Main component ─────────────────────────────────────────────────────────

export function ApiDemo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("curl");
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveQuery = query.trim() || "open source search engine";

  const snippets: Record<Tab, string> = {
    curl: getCurlSnippet(effectiveQuery),
    python: getPythonSnippet(effectiveQuery),
    js: getJsSnippet(effectiveQuery),
  };

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const s = query.trim();
      if (!s) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ s });
        const res = await fetch(
          `https://api.mwmbl.org/api/v1/search/?${params}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  const jsonString = results
    ? JSON.stringify(results.slice(0, 5), null, 2)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="w-full max-w-6xl mx-auto px-4"
    >
      {/* Search input */}
      <form onSubmit={handleSearch} className="relative mb-8">
        <div className="flex items-center gap-3 border border-border bg-card rounded-sm px-4 py-3 focus-within:border-accent-text transition-colors group">
          <Search
            size={18}
            className="text-muted-foreground group-focus-within:text-accent-text transition-colors shrink-0"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the ethical web…"
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-mono text-sm"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            suppressHydrationWarning
            className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "RUN"
            )}
          </button>
        </div>
      </form>

      {/* Results + Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LHS — JSON results */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              JSON Response
            </span>
            {jsonString && <CopyButton text={jsonString} />}
          </div>
          <div className="flex-1 border border-border rounded-sm bg-card overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-muted/30">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-muted-foreground">
                response.json
              </span>
            </div>
            <div className="p-4 overflow-auto max-h-[420px] text-xs leading-relaxed">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Loader2 size={14} className="animate-spin" />
                    <span>Fetching results…</span>
                  </motion.div>
                )}
                {error && !loading && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-destructive"
                  >
                    {`// Error: ${error}`}
                  </motion.div>
                )}
                {!loading && !error && jsonString && (
                  <motion.pre
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="font-mono whitespace-pre-wrap break-all"
                    dangerouslySetInnerHTML={{
                      __html: highlightJson(jsonString),
                    }}
                  />
                )}
                {!loading && !error && !jsonString && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-muted-foreground/50 select-none"
                  >
                    <span className="text-accent-text/40">{"// "}</span>
                    {"Results will appear here after you run a search"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RHS — Code snippets */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Code Snippet
            </span>
          </div>
          <div className="flex-1 border border-border rounded-sm bg-card overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center border-b border-border bg-muted/30">
              {TAB_LABELS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative px-4 py-2.5 text-xs font-semibold transition-colors ${
                    activeTab === id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  {activeTab === id && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-text"
                    />
                  )}
                </button>
              ))}
              {/* Copy button pushed to right */}
              <div className="ml-auto px-3 py-2">
                <CopyButton text={snippets[activeTab]} />
              </div>
            </div>

            {/* Snippet content */}
            <div className="p-4 overflow-auto max-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={activeTab}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="text-xs leading-relaxed font-mono text-card-foreground whitespace-pre-wrap break-all"
                >
                  {snippets[activeTab]}
                </motion.pre>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
