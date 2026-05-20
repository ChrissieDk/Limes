# Limes

Limes is a South African mobile network that lets customers order SIMs, manage plans, top up bundles, port numbers, and track deliveries — all from a single web dashboard. No store visits. No paperwork marathons.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Auth & Backend | Firebase (Auth + Cloud Functions) |
| Payments | Paystack |
| Error Tracking | Sentry |
| Testing | Vitest + React Testing Library |

---

## Project Structure

```
src/
├── modules/
│   ├── auth/           # Auth, landing pages, dashboard, how-to guides
│   ├── payment/        # Payment methods, transactions, Paystack integration
│   ├── subscription/   # Plans, bundles, porting, activation
│   ├── catalog/        # Product catalogue and pricing
│   ├── crm/            # Customer account details
│   ├── rica/           # SIM registration (RICA) services
│   ├── warehouse/      # Delivery tracking
│   └── analytics/      # Analytics services
├── components/         # Shared UI components
├── config/             # Firebase, API, and Paystack config
├── types/              # Shared TypeScript types
└── utils/              # Helpers and formatters
```

---

## Key Features

- **Landing & Marketing** — Plan comparisons, trust bar, partner showcase, reviews
- **Auth Flow** — Sign up / sign in via Firebase Auth, email verification, password reset
- **Dashboard** — SIM management, balance checks, top-ups, transaction history
- **Packages** — Prepaid and subscription bundles (data, voice, SMS, WhatsApp)
- **How-To Guides** — Step-by-step walkthroughs for joining, RICA, activation, porting, delivery, and top-ups
- **Porting** — Keep your existing number when switching to Limes
- **RICA** — Online SIM registration with ID and proof-of-address upload
- **Delivery Tracking** — Courier integration for SIM delivery status
- **Payments** — Secure checkout via Paystack

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run tests once (CI)
npm run test:run

# Preview production build
npm run preview
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_*` | Firebase project config |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack integration |
| `VITE_API_BASE_URL` | Backend API endpoint |
| `SENTRY_*` | Sentry error tracking |

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once (for CI) |
| `npm run lint` | Run ESLint |

---

## Notes

- The app uses `BASE_URL` from Vite for static asset paths (images, icons).
- Firebase Cloud Functions live in the `/functions` directory at the project root.
- Sentry source maps are uploaded automatically during the build when `SENTRY_AUTH_TOKEN` is set.
