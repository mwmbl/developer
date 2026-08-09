# E2E tests

Playwright specs that drive the app in a real browser against the **live**
`https://beta.mwmbl.org` backend (see `API_BASE` in `src/lib/api.ts`). These
are intentionally **not** part of `npm test` or CI — they hit a real service,
need real credentials, and (in `billing.spec.ts`) touch a real Polar sandbox
checkout session.

## One-time setup

```bash
npx playwright install chromium
```

Create `.env.e2e.local` in the repo root (already gitignored via the `.env*`
rule) with credentials for an **existing, email-confirmed** account on
beta.mwmbl.org:

```
E2E_TEST_EMAIL=you@example.com
E2E_TEST_PASSWORD=your-account-password
```

A fresh account can't be created and confirmed automatically — confirmation
requires clicking a link sent to a real inbox, which this suite has no access
to. `auth.spec.ts`'s signup test registers new throwaway accounts to exercise
the registration API itself, but never confirms them.

## Running

```bash
npm run test:e2e
```

This starts `next dev` (via Playwright's `webServer`) and runs all specs
against it in Chromium. Pass `--grep` / a file path to run a subset, e.g.:

```bash
npx playwright test e2e/dashboard.spec.ts
```

Since every spec hits the real backend, expect occasional flakiness under
backend rate-limiting or slowness — e.g. running the whole suite back-to-back
several times in a row can trigger login rate-limiting that makes
`auth.spec.ts`'s wrong-password test see a different error than usual (it
tolerates this), or make `dashboard.spec.ts` time out waiting on a slow
response. Re-running the affected spec on its own is usually enough.

## What's covered

- `marketing.spec.ts` — home page, the anonymous search demo against the
  real `api.mwmbl.org` search API, nav, pricing CTAs. No auth needed.
- `auth.spec.ts` — sign-in success/failure, real signup against the live
  backend, confirm-email's invalid-link state.
- `dashboard.spec.ts` — authenticated usage display, full API-key
  create/revoke lifecycle, terms-of-service banner. Runs serially against the
  shared test account and cleans up after itself (revokes any key it
  creates).
- `billing.spec.ts` — verifies that starting pay-as-you-go for a new customer
  creates a real Polar checkout session and that its URL is on Polar's
  **sandbox** host, refusing to proceed otherwise. Deliberately stops short of
  submitting a payment — see the comment at the top of the file for why.

## Notes

- The shared test account accumulates real API keys / a real (uncompleted)
  Polar checkout session if specs are interrupted mid-run. `dashboard.spec.ts`
  cleans up the key it creates; nothing else needs manual cleanup because
  nothing else changes persistent account state.
- Tests run with a single worker (`playwright.config.ts`) since they share
  one real account — parallelizing would race sign-ins and API-key state.
