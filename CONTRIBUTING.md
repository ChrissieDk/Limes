# Contributing with AI Agents

All implementation is performed through AI agents. Humans own product intent, approvals, production access, and irreversible decisions.

## Start

1. Read `AGENTS.md`.
2. Install the validated agent-skill revision through your agent host, following `AGENTS.md`.
3. Bootstrap locked repository dependencies and verification with `sh scripts/agent-bootstrap.sh`, or run its documented steps individually.
4. Create a short-lived branch.
5. Create an approved specification for non-trivial work.
6. Update `tasks/plan.md` and `tasks/todo.md`.

## Build

Follow the skill lifecycle and implement test-first in small, reversible slices. Preserve unrelated work and never silently infer missing product requirements.

## Verify

Run:

```bash
npm run verify
```

For user-visible changes, also provide browser/runtime evidence. For auth, payment, RICA, uploads, Functions, or external API changes, perform a separate security review.

## Review and merge

Use the pull request template. GitHub quality gates must pass. Configure branch protection on the repository default branch (`master` unless the repository is intentionally renamed) to require:

- `Root app`
- `Firebase Functions`
- `Secret scan`
- At least one approval
- Conversation resolution
- Linear history

Disable force pushes and branch deletion. Prefer squash or rebase merges with conventional commit titles.

## Production

Agents may prepare deployments but may not deploy, rotate secrets, alter billing/IAM, or delete production data without explicit approval. Follow `docs/deployment.md`.
