# Deployment and Rollback

## Policy

Agents may prepare deployment artifacts and checklists, but production deployment requires explicit human approval. CI success is necessary but not sufficient.

## Environments

- Local: developer/agent machine with placeholder or test credentials
- CI: no production secrets; deterministic tests only
- Preview/staging: isolated Firebase/API/Paystack test configuration
- Production: secrets stored in Firebase, Vercel, and GitHub environment protection

## Pre-deployment gate

```bash
npm ci
npm --prefix functions ci
npm run verify
```

Additionally:

- Review dependency advisories and lockfile changes.
- Confirm `.env` and credentials are not tracked.
- Verify critical browser journeys in preview/staging.
- Review Sentry and operational dashboards.
- Document changed behavior, migration needs, and rollback trigger.

## Frontend

The SPA is configured for Vercel rewrites. Deploy previews should be used for pull requests. Production promotion should use a protected GitHub Environment or the Vercel dashboard.

Rollback: redeploy the last known-good immutable deployment. Do not patch production directly.

## Firebase Functions

Runtime is Node.js 20. Deploy only the intended Functions from a clean build after secret bindings are verified.

Rollback options:

1. Redeploy the last known-good tag/commit.
2. Disable the affected caller or feature if a safe flag exists.
3. Rotate/revoke compromised credentials immediately when relevant.

## Post-deployment observation

For at least 15 minutes, monitor:

- Authentication failures
- Payment initialization/verification failures
- Subscriber/provisioning/refund errors
- Cloud Function exceptions and latency
- Delivery and external API errors
- Unexpected PII or token logging

Rollback when error rate, payment integrity, authorization, or data correctness degrades. Do not wait for a second incident when money or PII is involved.
