"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2
        className="text-base font-semibold text-foreground"
        style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-1.5 pl-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-accent-text mt-1 shrink-0 text-xs">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border text-left">
            {headers.map((h) => (
              <th key={h} className="py-2 pr-6 font-semibold text-foreground last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-muted-foreground">
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/40">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-6 last:pr-0 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Nav />

      <main className="flex-1 px-4 py-16">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl mx-auto flex flex-col gap-10"
        >
          <header className="border-b border-border/50 pb-8">
            <p className="text-xs text-accent-text font-mono mb-3">Legal</p>
            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-3"
              style={{ fontFamily: "'Hind Vadodara', sans-serif" }}
            >
              API Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Effective Date: [DATE]
            </p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              This policy explains how Mwmbl Foundation, a private company
              limited by guarantee registered in the United Kingdom
              (&ldquo;Mwmbl&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;),
              collects, processes, and protects personal data in connection with
              your use of the Mwmbl Search API. It applies to API users and
              supplements the general{" "}
              <a
                href="https://mwmbl.org/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-text hover:underline"
              >
                Data Privacy Policy
              </a>{" "}
              which covers use of the Mwmbl website. We process personal data in
              compliance with the{" "}
              <span className="text-foreground font-medium">
                UK General Data Protection Regulation (UK GDPR)
              </span>{" "}
              and the{" "}
              <span className="text-foreground font-medium">
                Data Protection Act 2018
              </span>
              .
            </p>
          </header>

          <Section title="Data Controller">
            <p>
              Mwmbl Foundation is the data controller for personal data
              processed in connection with the API. Contact:{" "}
              <a
                href="mailto:info@mwmbl.org"
                className="text-accent-text hover:underline"
              >
                info@mwmbl.org
              </a>
              .
            </p>
          </Section>

          <Section title="Information We Collect">
            <p>
              When you register for and use the API, we may process the
              following categories of personal data:
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-foreground font-medium mb-1.5">Account data</p>
                <Ul
                  items={[
                    "Name, email address, and username provided at registration.",
                  ]}
                />
              </div>
              <div>
                <p className="text-foreground font-medium mb-1.5">API usage data</p>
                <Ul
                  items={[
                    "API key identifiers (not the key value itself after initial creation).",
                    "Request timestamps and monthly request counts, used to enforce quotas and rate limits.",
                    <span key="ip">
                      IP addresses associated with API requests, held
                      transiently in memory and{" "}
                      <span className="text-foreground">
                        not written to persistent storage
                      </span>
                      .
                    </span>,
                    <span key="queries">
                      Search queries submitted via the API are{" "}
                      <span className="text-foreground">not logged or retained</span>.
                    </span>,
                  ]}
                />
              </div>
              <div>
                <p className="text-foreground font-medium mb-1.5">Billing data</p>
                <p>
                  For paid plans, payment is processed by{" "}
                  <span className="text-foreground font-medium">Polar.sh</span>{" "}
                  acting as our payment processor. Mwmbl does not receive or
                  store payment card details. We receive and retain the Polar
                  customer identifier, subscription status, current plan, and
                  billing period dates in order to manage your account.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Lawful Basis for Processing">
            <SimpleTable
              headers={["Purpose", "Lawful basis"]}
              rows={[
                [
                  "Providing API access and enforcing quotas",
                  "Contract — Article 6(1)(b) UK GDPR",
                ],
                [
                  "Managing billing and subscriptions",
                  "Contract — Article 6(1)(b) UK GDPR",
                ],
                [
                  "Security, fraud prevention, and abuse detection",
                  "Legitimate interests — Article 6(1)(f) UK GDPR",
                ],
                [
                  "Compliance with legal obligations",
                  "Legal obligation — Article 6(1)(c) UK GDPR",
                ],
                [
                  "Responding to account or support enquiries",
                  "Legitimate interests — Article 6(1)(f) UK GDPR",
                ],
              ]}
            />
          </Section>

          <Section title="Data Sharing">
            <p>
              Mwmbl does not sell or commercially exploit your personal data. We
              share data only in the following circumstances:
            </p>
            <Ul
              items={[
                <span key="polar">
                  <span className="text-foreground font-medium">Polar.sh</span>
                  : As our payment processor, Polar.sh receives the data
                  necessary to create and manage your subscription. Polar.sh&apos;s
                  own privacy policy governs their use of that data.
                </span>,
                "Infrastructure subprocessors: hosting, error tracking, email delivery, and backups, each acting as a data processor under contract with Mwmbl.",
                "Legal authorities: where required to comply with applicable UK law or a lawful request.",
              ]}
            />
          </Section>

          <Section title="Data Retention">
            <SimpleTable
              headers={["Data", "Retention period"]}
              rows={[
                ["Account data", "Duration of account, plus 12 months after closure"],
                ["Monthly usage counters", "Automatically expire after 35 days"],
                ["Billing records", "7 years (statutory accounting obligation)"],
                ["Support correspondence", "2 years after resolution"],
              ]}
            />
          </Section>

          <Section title="Your Rights Under UK GDPR">
            <p>You have the following rights in relation to your personal data:</p>
            <Ul
              items={[
                <span key="access"><span className="text-foreground font-medium">Right to Access (Article 15)</span>: Request a copy of the data we hold about you.</span>,
                <span key="rect"><span className="text-foreground font-medium">Right to Rectification (Article 16)</span>: Request correction of inaccurate data.</span>,
                <span key="erasure"><span className="text-foreground font-medium">Right to Erasure (Article 17)</span>: Request deletion of your data, subject to legal retention obligations.</span>,
                <span key="restrict"><span className="text-foreground font-medium">Right to Restriction of Processing (Article 18)</span>: Request that we limit how we use your data.</span>,
                <span key="portability"><span className="text-foreground font-medium">Right to Data Portability (Article 20)</span>: Request a structured, machine-readable copy of your data.</span>,
                <span key="object"><span className="text-foreground font-medium">Right to Object (Article 21)</span>: Object to processing based on legitimate interests.</span>,
              ]}
            />
            <p>
              To exercise any of these rights, contact{" "}
              <a href="mailto:info@mwmbl.org" className="text-accent-text hover:underline">
                info@mwmbl.org
              </a>
              . We will respond within one month. You also have the right to
              lodge a complaint with the{" "}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-text hover:underline"
              >
                Information Commissioner&apos;s Office (ICO)
              </a>
              .
            </p>
          </Section>

          <Section title="Data Security">
            <p>
              Mwmbl implements appropriate technical and organisational measures
              to protect personal data, including:
            </p>
            <Ul
              items={[
                "Encryption of data in transit (TLS) and at rest.",
                "Access controls limiting data access to authorised personnel only.",
                "Use of transient in-memory storage for rate-limit and quota counters to minimise persistent data exposure.",
                "In the event of a personal data breach, we will notify affected individuals and the ICO as required under UK GDPR Articles 33–34.",
              ]}
            />
          </Section>

          <Section title="International Transfers">
            <p>
              Personal data processed in connection with the API is not
              transferred outside the United Kingdom or European Economic Area,
              except to the extent that any subprocessor infrastructure operates
              in jurisdictions covered by a UK adequacy decision or appropriate
              safeguards.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this policy as the service evolves. Significant
              changes will be communicated by email or via your account
              dashboard prior to taking effect.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              For privacy-related enquiries, contact{" "}
              <a href="mailto:info@mwmbl.org" className="text-accent-text hover:underline">
                info@mwmbl.org
              </a>
              .
            </p>
          </Section>
        </motion.article>
      </main>

      <Footer />
    </div>
  );
}
