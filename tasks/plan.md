# Implementation Plan: AI-Only Engineering Readiness

## Overview
Make Limes portable and safe for AI-only engineering through repository-owned context, workflow artifacts, deterministic local verification, and GitHub enforcement.

## Architecture decisions
- `AGENTS.md` is the tool-neutral mandatory entry point.
- External skills are installed rather than vendored; project-specific policy remains local.
- CI verifies but does not deploy production.
- Production, secrets, billing, IAM, and destructive operations remain human-approved.

## Phase 1: Portable context
- [x] Add agent operating manual.
- [x] Add architecture, testing, security, deployment, and workflow docs.
- [x] Add spec and ADR templates.
- [x] Record the AI-only engineering ADR and approved spec.

## Phase 2: Local enforcement
- [x] Add root and Functions verification scripts.
- [x] Add agent bootstrap script.
- [x] Expand generated-artifact and secret exclusions.
- [x] Validate `npm run verify`.

## Phase 3: GitHub enforcement
- [x] Add root/Functions quality workflow and secret scanning.
- [x] Add advisory dependency audit and Dependabot.
- [x] Add issue and pull-request templates.
- [ ] Enable branch protection and required checks in GitHub settings (requires repository-admin access).

## Phase 4: Hardening wave
- [x] Add Playwright critical-journey tests with deterministic local runtime.
- [x] Add Firebase Emulator/callable Function integration tests without production services.
- [x] Triage findings and apply non-forced lockfile remediation; retain one expiring React Router exception pending compatible upgrade.
- [x] Establish bundle-size and accessibility budgets and reduce the initial JavaScript payload.
- [ ] Protect the actual default branch (`master`) after repository-admin access is granted.

## Risks
| Risk | Mitigation |
|---|---|
| Agent follows stale global instructions | Repository hierarchy in `AGENTS.md` wins. |
| Agent bypasses quality checks | One local command plus required CI checks. |
| Agent performs irreversible action | Explicit approval boundaries and no deployment workflow. |
| CI configuration differs from local | Both use committed npm scripts and lockfiles. |
| Dependency audits are currently noisy | Advisory workflow plus explicit remediation task; no forced upgrades. |
