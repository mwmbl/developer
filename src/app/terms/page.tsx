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

export default function TermsPage() {
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
              API Terms and Conditions
            </h1>
            <p className="text-sm text-muted-foreground">
              Effective Date: [DATE]
            </p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              These Terms and Conditions govern access to and use of the Mwmbl
              Search API (the &ldquo;API&rdquo;) provided by Mwmbl Foundation, a
              private company limited by guarantee registered in the United
              Kingdom (&ldquo;Mwmbl&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
              By registering for or using the API you agree to these terms.
            </p>
          </header>

          <Section title="API Access and API Keys">
            <p>
              Access to the API requires registration for an account and the
              creation of an API key. You are responsible for keeping your API
              key confidential and for all activity carried out under it. You
              must not share your API key with third parties or embed it in
              publicly accessible client-side code. If you believe your API key
              has been compromised, you must revoke it and generate a new one
              immediately via your account dashboard.
            </p>
            <p>
              Mwmbl reserves the right to revoke any API key at any time if we
              have reasonable grounds to believe it is being used in breach of
              these terms or in a manner that could harm the service or other
              users.
            </p>
          </Section>

          <Section title="Plans, Quotas, and Rate Limits">
            <p>API access is available on the following plans:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-6 font-semibold text-foreground">Plan</th>
                    <th className="py-2 pr-6 font-semibold text-foreground">Monthly quota</th>
                    <th className="py-2 font-semibold text-foreground">Rate limit</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    ["Free", "2,000 requests", "5 req/s"],
                    ["Starter", "10,000 requests", "5 req/s"],
                    ["Pro", "50,000 requests", "5 req/s"],
                    ["Enterprise", "Custom", "Custom"],
                  ].map(([plan, quota, rate]) => (
                    <tr key={plan} className="border-b border-border/40">
                      <td className="py-2 pr-6 font-mono text-foreground">{plan}</td>
                      <td className="py-2 pr-6 font-mono">{quota}</td>
                      <td className="py-2 font-mono">{rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Quotas reset on the first day of each calendar month. Requests
              that exceed your monthly quota or the per-second rate limit will
              receive an error response. Mwmbl does not carry over unused quota
              between months.
            </p>
            <p>
              Plan details, including pricing, are published on the{" "}
              <Link href="/pricing" className="text-accent-text hover:underline">
                pricing page
              </Link>
              . Enterprise enquiries should be directed to{" "}
              <a
                href="mailto:hello@mwmbl.org"
                className="text-accent-text hover:underline"
              >
                hello@mwmbl.org
              </a>
              .
            </p>
          </Section>

          <Section title="Payment and Billing">
            <p>
              Paid plans (Starter, Pro, and Enterprise) are billed on a monthly
              subscription basis. Payment is processed by Polar.sh on behalf of
              Mwmbl; by subscribing to a paid plan you also agree to Polar.sh&apos;s
              terms of service and authorise them to process your payment
              details.
            </p>
            <p>
              Subscriptions are billed in advance at the start of each billing
              period. If payment fails, access may be downgraded to the Free
              plan until payment is resolved. Mwmbl does not issue refunds for
              partial months or unused quota except where required by applicable
              law.
            </p>
            <p>
              To cancel a subscription, do so via your account dashboard before
              the next billing date. Cancellation takes effect at the end of the
              current billing period.
            </p>
          </Section>

          <Section title="Permitted Use">
            <p>
              You may use the API for any lawful purpose, including commercial
              applications, subject only to the restrictions below. No
              attribution to Mwmbl is required.
            </p>
          </Section>

          <Section title="Prohibited Use">
            <p>You must not use the API to:</p>
            <Ul
              items={[
                "Violate any applicable law or regulation.",
                "Transmit or facilitate the transmission of unlawful, harmful, or fraudulent content.",
                "Attempt to reverse-engineer, decompile, or otherwise derive the source code or underlying model of the service beyond what is disclosed under the AGPL-3.0 licence.",
                "Probe, scan, or test the vulnerability of any Mwmbl system or network without prior written authorisation.",
                "Interfere with or disrupt the integrity or performance of the API or its infrastructure.",
                "Circumvent or attempt to circumvent quota or rate-limit enforcement.",
              ]}
            />
          </Section>

          <Section title="No Service Level Agreement">
            <p>
              The API is provided on a best-efforts basis. Mwmbl makes no
              commitment regarding uptime, availability, response times, or
              continuity of service. We may modify, suspend, or discontinue the
              API or any plan at any time, and will endeavour to give reasonable
              notice where practicable.
            </p>
          </Section>

          <Section title="Intellectual Property">
            <p>
              Mwmbl retains all intellectual property rights in the API and its
              underlying software. Nothing in these terms grants you any rights
              in Mwmbl&apos;s trademarks, logos, or branding.
            </p>
            <p>
              Search results returned by the API are derived from publicly
              available web content and data contributed by the Mwmbl community,
              made available under the{" "}
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-text hover:underline"
              >
                Creative Commons Attribution-NonCommercial-ShareAlike 4.0
                International Licence (CC BY-NC-SA 4.0)
              </a>
              . Your use of search results is subject to that licence and to any
              rights held by the original content owners.
            </p>
          </Section>

          <Section title="Disclaimer and Limitation of Liability">
            <p>
              The API is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; without warranties of any kind, express or
              implied, including warranties of merchantability, fitness for a
              particular purpose, or non-infringement.
            </p>
            <p>
              To the fullest extent permitted by law, Mwmbl shall not be liable
              for any indirect, consequential, special, incidental, or punitive
              damages arising out of or in connection with your use of the API,
              including but not limited to loss of revenue, loss of data, or
              business interruption, even if Mwmbl has been advised of the
              possibility of such damages.
            </p>
            <p>
              Mwmbl&apos;s total aggregate liability to you in connection with
              these terms shall not exceed the total fees paid by you to Mwmbl
              in the three months immediately preceding the event giving rise to
              the claim, or £100, whichever is greater.
            </p>
          </Section>

          <Section title="Changes to These Terms">
            <p>
              Mwmbl may update these terms from time to time. We will notify you
              of material changes by email or via your account dashboard.
              Continued use of the API after the effective date of any changes
              constitutes your acceptance of the updated terms. If you do not
              accept the updated terms, you must stop using the API and cancel
              any paid subscription.
            </p>
          </Section>

          <Section title="Governing Law and Jurisdiction">
            <p>
              These terms are governed by the laws of England and Wales. Any
              disputes arising from these terms or your use of the API shall be
              subject to the exclusive jurisdiction of the courts of England and
              Wales.
            </p>
          </Section>

          <Section title="Severability">
            <p>
              If any provision of these terms is found to be invalid or
              unenforceable, the remaining provisions shall continue in full
              force and effect.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              For questions about these terms, contact us at{" "}
              <a
                href="mailto:info@mwmbl.org"
                className="text-accent-text hover:underline"
              >
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
