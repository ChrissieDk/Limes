# ADR-001: Repository-owned AI-only engineering workflow

## Status
Accepted

## Date
2026-08-03

## Context
The project owner relies fully on AI agents for software engineering. Global agent configuration is not portable, and agent claims cannot substitute for deterministic quality gates. The repository needs enough persistent context and automation for a fresh agent to work safely without undocumented human knowledge.

## Decision
Adopt a tool-neutral, repository-owned workflow:

- `AGENTS.md` is the mandatory session entry point.
- Addy Osmani's `agent-skills` provides lifecycle workflows but is installed on each agent host rather than vendored.
- Specs, ADRs, architecture, testing, security, and deployment documentation are stored in the repository.
- `npm run verify` is the local Definition of Done.
- GitHub Actions independently enforces root and Functions quality gates.
- Agents may make reversible repository changes autonomously but require explicit approval for production, secrets, billing, IAM, destructive data operations, and history rewrites.

## Alternatives considered

### Depend only on global prompts and skills
- Benefits: no repository files
- Costs: non-portable and invisible to CI/new agents
- Rejected: cannot support reliable AI-only maintenance

### Vendor the complete external skill repository
- Benefits: fully local copy
- Costs: large duplicated content and update drift
- Rejected: keep project rules local and install the maintained skill pack separately

## Security and privacy consequences
Agent permissions are explicitly bounded. External content and model output are treated as untrusted. Production and secret changes remain approval-gated.

## Operational consequences
CI and documentation become part of the product. Changes that cannot pass verification or explain rollback risk cannot merge.

## Verification
A fresh agent should be able to read `AGENTS.md`, install the validated skills through its host, bootstrap locked repository dependencies, run `npm run verify`, locate architecture/security context, create a spec, and prepare a CI-verified change without relying on prior conversation history.
