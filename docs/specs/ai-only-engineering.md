# Specification: AI-only engineering readiness

## Status
Implemented

## Problem
The project owner relies on AI agents rather than human-written code. The repository previously depended on transient/global agent context, had no CI enforcement, and lacked durable architecture, security, testing, and deployment guidance.

## Desired outcome
A fresh AI agent can enter the repository, discover authoritative instructions, install the validated workflow skills through its host, bootstrap locked repository dependencies, create specs/plans, implement safely, run one deterministic quality gate, and submit a CI-verified change without undocumented context.

## Users and use cases
- Primary user: project owner directing AI agents
- Main use case: autonomous implementation of reversible repository changes
- Abuse/misuse case: an over-permissioned agent deploys, leaks secrets, weakens gates, or invents product behavior

## Scope
### In scope
- Repository-owned agent operating manual
- Architecture, testing, security, deployment, and workflow documentation
- Spec and ADR templates
- Local root/Functions verification command
- GitHub quality, coverage, and secret-scanning workflow
- Advisory dependency auditing and Dependabot
- Structured issue and PR intake
- Explicit autonomy and production approval boundaries

### Non-goals
- Autonomous production deployment
- Replacing human product intent or legal/privacy decisions
- Vendoring the complete external skill pack
- Solving all application coverage, dependency, performance, or browser-test debt in this change

## Requirements
1. `AGENTS.md` is the mandatory portable entry point.
2. The Addy Osmani skill lifecycle is required; host installation and repository bootstrap are separate trust boundaries.
3. `npm run verify` covers root and Functions lint, tests, and builds.
4. CI independently runs quality/coverage gates and secret scanning.
5. Significant work requires a spec, plan, tests, review, and documentation.
6. Security-sensitive and irreversible operations require explicit approval.
7. Agents receive architecture, security, testing, and deployment context.
8. GitHub intake templates collect reproducible, non-sensitive requirements.

## Acceptance criteria
- [x] A fresh agent can locate commands and boundaries from `AGENTS.md`.
- [x] `sh scripts/agent-bootstrap.sh` describes a reproducible bootstrap path.
- [x] `npm run verify` passes locally.
- [x] Root and Functions CI jobs use their supported Node runtimes.
- [x] Workflow and issue-template YAML parses successfully.
- [x] Secret scanning and advisory dependency auditing are configured.
- [x] Architecture, testing, security, deployment, spec, and ADR documents exist.
- [ ] GitHub administrator enables branch protection and required checks on the repository default branch (`master` currently).

## Interfaces and data
No runtime product API or data-schema changes. New public engineering interfaces are `AGENTS.md`, `npm run verify`, documentation templates, and GitHub workflows.

## Security and privacy
- Assets affected: source, secrets, production access, PII/payment workflows
- Trust boundaries: agents, fetched content, CI logs, external actions, npm packages
- Authorization: destructive/production operations remain human-approved
- Validation: CI parses/builds/tests repository changes; agents validate external data in code
- PII/logging impact: instructions explicitly prohibit production PII in prompts, tests, fixtures, and logs
- Abuse controls: secret scanning, protected branch requirements, scoped workflow permissions, no automatic deploy

## Testing strategy
- Run `npm run verify`.
- Parse all authored YAML with Ruby/Psych.
- Confirm bootstrap script executable.
- Confirm project diagnostics have no blocking errors; editor-only Tailwind modernization suggestions are recorded rather than treated as gate failures.
- GitHub-hosted execution is verified after workflows are pushed.

## Rollout and rollback
- Rollout: commit and push documentation/CI changes; enable branch protection after checks appear.
- Monitoring: inspect first GitHub Actions run and Dependabot behavior.
- Rollback: revert individual governance/config files; do not remove `AGENTS.md` or quality gates merely to bypass failures.

## Open questions
- Whether to add Playwright and Firebase Emulator browser/integration gates in the next phase.
- Which GitHub account/team should be required as code owner.

## Approval
Approved by: repository owner via conversation
Date: 2026-08-03
