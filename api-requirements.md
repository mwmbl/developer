# API Requirements — Missing Endpoints

These endpoints are required to wire up the marketing/sign-up frontend and Polar.sh payment
integration. The existing API spec (`openapi.json`) already covers auth (register, token, confirm
email), search, and API key CRUD. Everything below is additive.

---

## 1. Get current user profile

**`GET /api/v1/platform/users/me`**

Returns the authenticated user's own profile. Used on the dashboard to display username, email,
and current plan tier.

**Auth:** JWT bearer (required)

**Response 200:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "plan": "pro",
  "email_confirmed": true
}
```

`plan` is one of `"anonymous"`, `"free"`, `"starter"`, `"pro"`, `"enterprise"`.

---

## 2. Get current subscription

**`GET /api/v1/platform/billing/subscription`**

Returns the user's active plan details, quota, and current-period usage. Used on the dashboard
to show "You've used X of Y requests this month" and the current plan name.

**Auth:** JWT bearer (required)

**Response 200:**
```json
{
  "plan": "pro",
  "status": "active",
  "monthly_limit": 50000,
  "monthly_usage": 12340,
  "current_period_end": "2026-05-01T00:00:00Z",
  "polar_customer_id": "pol_cus_abc123"
}
```

`status` is one of `"active"`, `"canceled"`, `"past_due"`, `"free"`.
`polar_customer_id` may be `null` for free-tier users.
`current_period_end` may be `null` for free-tier users.

---

## 3. Create Polar checkout session

**`POST /api/v1/platform/billing/checkout`**

Creates a Polar hosted-checkout session for the authenticated user and returns a redirect URL.
The backend embeds the user's internal ID in the Polar checkout metadata so the webhook
(endpoint 4) can match the payment back to the correct account.

**Auth:** JWT bearer (required)

**Request body:**
```json
{
  "plan": "starter"
}
```

`plan` must be `"starter"` or `"pro"`. Enterprise is handled via email (`hello@mwmbl.org`).

**Response 200:**
```json
{
  "checkout_url": "https://buy.polar.sh/checkout/..."
}
```

The frontend redirects the user to `checkout_url`. Polar's success redirect should be configured
to `https://api.mwmbl.org/dashboard?upgraded=true` (or whatever the dashboard URL will be).

**Implementation notes:**
- Use the Polar API to create a checkout session, passing `metadata: { user_id: "<internal_id>" }`.
- Map `plan` to the corresponding Polar product ID from environment config
  (`POLAR_PRODUCT_ID_STARTER`, `POLAR_PRODUCT_ID_PRO`).
- If the user already has a `polar_customer_id`, pass it to Polar so their card is pre-filled.

---

## 4. Polar webhook receiver

**`POST /api/v1/platform/billing/webhook`**

Receives signed webhook events from Polar and updates the user's plan accordingly.
This endpoint must **not** require JWT auth — Polar calls it server-to-server.

**Auth:** None (JWT). Must verify the `Polar-Signature` header against `POLAR_WEBHOOK_SECRET`.
Return `400` immediately if the signature is invalid.

**Events to handle:**

| Polar event | Action |
|---|---|
| `subscription.created` | Look up user by `metadata.user_id`; set plan from Polar product; store `polar_customer_id` and `polar_subscription_id` on the user record. |
| `subscription.updated` | Update plan (handles upgrades and downgrades). |
| `subscription.canceled` | Downgrade user to `free` plan at period end (use `current_period_end` from the payload to schedule or set immediately). |
| `subscription.revoked` | Immediately downgrade user to `free`. |

**Response:** `200 OK` with `{"status": "ok"}` for all successfully handled events. Return `200`
even for unrecognised event types (so Polar doesn't retry them).

**Implementation notes:**
- Polar webhook payload shape: `{ "type": "subscription.created", "data": { ... } }`.
- `data.metadata.user_id` is the internal user ID set during checkout creation (endpoint 3).
- `data.product_id` maps to the plan tier — use the same product ID → plan mapping as endpoint 3.

---

## 5. Password reset flow

### 5a. Request password reset

**`POST /api/v1/platform/forgot-password`**

Sends a password-reset email to the given address. Always returns `200` regardless of whether
the email exists (prevents user enumeration).

**Auth:** None

**Request body:**
```json
{
  "email": "alice@example.com"
}
```

**Response 200:**
```json
{}
```

### 5b. Confirm password reset

**`POST /api/v1/platform/reset-password`**

Validates the reset token from the email and sets a new password.

**Auth:** None

**Request body:**
```json
{
  "email": "alice@example.com",
  "key": "<token from email>",
  "new_password": "correct-horse-battery-staple"
}
```

**Response 200:**
```json
{}
```

**Response 400** if the token is invalid or expired:
```json
{
  "message": "Invalid or expired reset token."
}
```

---

## Frontend notes (not API changes, but needed to complete the wiring)

These are gaps in the frontend that the API already supports but the frontend hasn't implemented:

- **Sign-in page** (`/signin`) does not exist. The API has `POST /api/v1/platform/token/pair`.
- **Email confirmation page** does not exist. Users receive a link with `username`, `email`, and
  `key` params; `POST /api/v1/platform/confirm-email` is already implemented.
- **Pricing page CTAs**: Starter ($10/mo) and Pro ($25/mo) both currently link to `/signup`.
  After billing is wired up, these should trigger checkout (endpoint 3) for authenticated users,
  or redirect to `/signup?plan=starter` for unauthenticated users so the plan is remembered.
