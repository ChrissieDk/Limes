# Testing Strategy

## Purpose

Tests are executable product contracts for agents. They must prove observable behavior and remain deterministic.

## Test layers

### Unit tests

Use Vitest for pure transformations, schemas, formatting, pricing, error mapping, and decision logic. Avoid network, timers, and global state unless explicitly controlled.

### Integration tests

Test service clients and hooks with deterministic boundary fakes. Assert request/response behavior and user-visible outcomes, not internal call ordering unless the call itself is the contract.

### Component tests

Use React Testing Library. Cover:

- Initial/loading state
- Success state
- Empty state
- Recoverable error state
- Validation and disabled states
- Keyboard and accessible-name behavior

### Browser tests

Critical journeys run in Chromium through Playwright against the local preview server; emulator-bound callable tests run separately against Firebase's local Functions emulator. Future journeys should use test-only Firebase/API environments:

1. Public landing and navigation
2. Unauthenticated dashboard redirect
3. Registration and sign-in validation
4. Provisioning/package redirect behavior
5. Checkout initialization, cancellation, and failed verification
6. Delivery tracking empty/error/success states
7. Contact-form validation

Never use real cards, production accounts, or production customer data.

## Commands

```bash
npm run test:run
npm run test:coverage
npm --prefix functions run test:run
npm --prefix functions run test:coverage
npm run test:e2e
npx --yes firebase-tools@14.11.1 emulators:exec --only functions "npm --prefix functions run test:emulator"
npm run verify
```

## Test rules

- Bug fixes start with a reproduction test.
- Freeze time for date-sensitive behavior.
- No live external network calls.
- Prefer real code, then fakes, then stubs; use mocks only at boundaries.
- Do not snapshot large pages as a substitute for behavior assertions.
- Do not skip or quarantine failures without a tracked issue and expiry date.
- Tests must pass independently and in any order.

## Coverage policy

Coverage is reported on every quality run. Current coverage is a baseline, not a target guarantee.

Agents must not reduce aggregate coverage without an explicit rationale. More importantly, these critical boundaries require direct tests:

- Authentication and route authorization
- Payment verification and refund paths
- Subscription cancellation/provisioning
- SIM inventory outcomes
- RICA validation/upload errors
- Cloud Function input validation and privacy-preserving responses
- Delivery fallback/error behavior

## Test data

Use synthetic South African-format identifiers clearly marked as test data. Never copy production payloads into fixtures, snapshots, logs, or prompts.
