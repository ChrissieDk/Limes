# Security Policy

## Reporting

Report suspected vulnerabilities through GitHub private security advisories. Do not open a public issue containing exploit details, credentials, tokens, customer data, or production payloads.

## Response expectations

- Initial acknowledgement target: 2 business days
- Triage/status update target: 5 business days
- Further updates: at least weekly until resolution or an agreed disclosure date

If GitHub private advisories are unavailable, contact the repository owner through a previously verified private channel. Do not send secrets or exploit details to an unverified address or public issue. Good-faith research that avoids privacy violations, service disruption, data modification, and unauthorized persistence is welcome.

## Scope

Security-sensitive areas include Firebase authentication, callable Functions, Paystack, saved cards, refunds, RICA documents, customer PII, SIM/subscription provisioning, and delivery data.

## Agent rules

Agents must follow `docs/security-model.md` and use the `security-and-hardening` workflow for sensitive changes. Agents may not deploy, rotate secrets, change IAM/billing, apply forced dependency upgrades, or modify production data without explicit human authorization.

## Supported version

Only the current production version is supported. Security fixes should be shipped as small, independently reversible changes with regression tests and a rollback plan.
