# Specification: AI-readiness hardening wave

## Status
In progress

## Problem
The repository has deterministic local and CI quality gates, but four follow-up gaps remain: no browser critical-journey coverage, no Firebase Emulator callable-handler coverage, known dependency advisories, and no enforced performance/accessibility budgets. GitHub branch protection is also not configured, and the repository's actual default branch (`master`) conflicts with existing documentation that names `main`.

## Desired outcome
Agents can validate representative browser journeys and callable Functions locally without production services; dependency risk is either remediated or explicitly evidenced and tracked; performance and accessibility regressions are bounded by CI; and the correct GitHub default branch is protected after human confirmation.

## Scope
- Add deterministic Playwright smoke coverage for public and authentication-entry journeys.
- Add callable-handler tests using Firebase's local/emulator-compatible test boundary and no production credentials.
- Upgrade dependencies in isolated, compatible increments where fixes are available, preserving lockfiles and running the full gate.
- Add bundle-size and accessibility checks with thresholds based on measured current output, then ratchet them down when optimization is proven.
- Correct branch-protection documentation and apply settings only after confirming the target branch.

## Non-goals
- No production Firebase, Paystack, Resend, or telecom calls in tests.
- No automatic production deployment.
- No forced dependency upgrades across major versions.
- No branch rename or branch protection change without explicit repository-owner confirmation.

## Security and privacy
- Browser tests use synthetic data only.
- Firebase tests use emulator/test doubles and never production credentials.
- Dependency remediation must not use `npm audit fix --force`.
- CI permissions remain read-only except where a GitHub check requires otherwise.

## Acceptance criteria
- [x] Playwright critical journeys run locally and in CI with deterministic dependencies.
- [x] Callable Function validation and security behavior are covered without external services.
- [x] High/critical production findings are either patched or have a current, package-specific reachability exception with an owner and expiry.
- [x] Bundle and accessibility budgets fail CI when regressed.
- [x] Initial bundle size is measured before and after route-level code splitting.
- [ ] The actual default branch has required checks and review protection after confirmation.

## Verification
- `npm run verify`
- Focused Playwright and Functions integration commands
- Bundle/accessibility budget command
- GitHub Actions run after push
- GitHub branch-protection API inspection after owner confirmation

## Rollback
Revert each isolated dependency/configuration/test slice independently. Do not remove quality gates to bypass failures. Branch protection can be adjusted by an administrator if the configured checks do not match the first Actions run.
