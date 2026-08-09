# Known issues found while writing E2E tests

Found while building the Playwright E2E suite (`e2e/`) in this session — see
`e2e/README.md` for how to run it. Not fixed yet; tracked here for a
follow-up session.

## 1. "Forgot password?" link 404s

`src/app/signin/page.tsx:80` links to `/forgot-password`, but no such route
exists (`src/app/` has no `forgot-password` directory) — clicking it 404s in
production.

The backend already supports both halves of the flow (per
`api-requirements.md` §5 and the live spec, `api-1(1).yaml`):

- `POST /api/v1/platform/forgot-password` — the frontend even has a client
  function for this already, `forgotPassword()` in `src/lib/api.ts:131`, but
  it's never called from anywhere (no page uses it).
- `POST /api/v1/platform/reset-password` — no client function exists for
  this at all yet.

**Fix**: add a `/forgot-password` page (email → calls `forgotPassword()` →
"check your inbox" confirmation, mirroring the pattern in
`src/app/signup/page.tsx`) and a `/reset-password` page (reads `email`/`key`
query params like `src/app/confirm-email/page.tsx` does, collects a new
password, calls a new `resetPassword()` function added to `src/lib/api.ts`).

## 2. Dead "Continue with GitHub" button on signup

`src/app/signup/page.tsx:115-121` renders a "Continue with GitHub" button
with no `onClick` handler — it's inert. Either wire it up to a real OAuth
flow or remove it until one exists; a button that visibly does nothing is
worse than no button.

## 3. `api-requirements.md` is stale on the signup `username` field

`api-requirements.md:183-184` says the register endpoint requires `username`
and that the signup form is missing a field for it. That's no longer true —
the live OpenAPI spec (`api-1(1).yaml:505-511`) documents `username` as
**optional** (auto-generated as `adjective_noun_NNN` if omitted), and
`e2e/auth.spec.ts`'s "creates an account against the live backend" test
confirms registering with just email/password succeeds against the real
backend today.

**Fix**: update or remove that paragraph in `api-requirements.md` so it
doesn't send someone chasing a gap that's already closed.
