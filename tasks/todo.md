# AI-Only Engineering Readiness Checklist

## Repository context
- [x] `AGENTS.md`
- [x] Architecture, testing, security, deployment, and agent workflow docs
- [x] Approved specification and ADR
- [x] Spec and ADR templates
- [x] README and contributing guidance

## Enforcement
- [x] Root `verify` and `verify:coverage` commands
- [x] Functions lint/test/build scripts
- [x] Executable agent bootstrap
- [x] GitHub root and Functions quality jobs
- [x] Secret scanning
- [x] Advisory dependency audits
- [x] Dependabot
- [x] PR and issue templates

## Validation
- [x] `npm run verify`
- [x] Workflow and template YAML parsing
- [x] Bootstrap executable check
- [x] Project diagnostics have no blocking errors; remaining editor warnings are non-blocking Tailwind modernization suggestions

## Human-admin follow-up
- [ ] Push the workflow changes and inspect the first Actions run.
- [ ] Protect the repository default branch (`master` currently) and require `Root app`, `Firebase Functions`, `Secret scan`, browser, and emulator checks.
- [ ] Require one approval and conversation resolution.
- [ ] Disable force pushes and branch deletion.
- [ ] Confirm the private security-advisory URL and repository ownership.

## Next engineering wave
- [x] Playwright critical journeys and accessibility checks
- [x] Firebase Emulator callable-handler tests
- [x] Non-forced dependency remediation and high/critical finding triage; React Router exception remains until a compatible fix is validated
- [x] Bundle-size and accessibility budgets
- [ ] Confirm whether `master` remains the protected default branch before applying branch protection
