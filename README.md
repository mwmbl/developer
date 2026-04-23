# Mwmbl API — Marketing & Dashboard Frontend

Next.js 16 frontend for the [Mwmbl](https://mwmbl.org) search API. Covers the public marketing site, pricing, sign-up/sign-in flows, email confirmation, and an authenticated dashboard for managing API keys and subscription usage.

## Pages

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/pricing` | Plan comparison (Anonymous / Free / Starter / Pro / Enterprise) |
| `/signup` | Registration form |
| `/signin` | Sign-in form |
| `/confirm-email` | Email confirmation handler |
| `/dashboard` | Authenticated API key management and usage stats |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

The frontend talks to the Mwmbl platform API. The full OpenAPI spec is in [openapi.json](openapi.json). Required endpoints not yet in the spec are documented in [api-requirements.md](api-requirements.md) — these cover billing (Polar.sh checkout + webhooks), user profile, and password reset.

## Tech Stack

- [Next.js 16](https://nextjs.org) with App Router
- [Tailwind CSS v4](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide React](https://lucide.dev) for icons

## Build

```bash
npm run build
npm start
```
