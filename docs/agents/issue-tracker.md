# Issue Tracker

How AI agents interact with project issues.

## Workflow

```
needs-triage → ready-for-agent → in-progress → in-review → done
                     ↑                           |
                     └─────── needs-info ←───────┘
```

1. **Triage** — New issues start as `needs-triage`. A human (or agent with context) adds labels and moves to `ready-for-agent`.
2. **Ready** — Clear requirements, acceptance criteria, and priority. Agents can self-assign.
3. **In Progress** — Agent working. Update with progress comments. One issue at a time.
4. **Review** — PR submitted. Human reviews. Agent addresses feedback.
5. **Done** — Merged and verified. Close the issue.

Blocked issues get `needs-info` until the blocker resolves.

## Labels

### State (exactly one)
- `needs-triage` — New, not yet evaluated
- `ready-for-agent` — Scoped and ready for implementation
- `needs-info` — Blocked, waiting for clarification
- `in-progress` — Agent actively working
- `in-review` — PR submitted, awaiting review

### Type (exactly one)
- `bug` — Something is broken
- `feature` — New capability
- `debt` — Refactor, cleanup, technical debt
- `docs` — Documentation only
- `spike` — Research/experiment, no production code

### Priority (exactly one)
- `p0-critical` — Production down, fix immediately
- `p1-high` — Blocks release or major user impact
- `p2-medium` — Important but not blocking
- `p3-low` — Nice to have, no urgency

## Agent Guidelines

- Read `CONTEXT.md` before working on any issue. Use domain terms.
- Read relevant ADRs in `docs/adr/` for architectural decisions.
- Follow existing patterns in the codebase. Don't invent new conventions.
- Write tests for behavior, not implementation. See `src/test/` for patterns.
- Update `CONTEXT.md` if you introduce a new domain term.
- Write an ADR if you make an architectural decision (new dependency, new pattern, significant refactor).
- Stories are documented in `src/**/*.stories.tsx`. Run `npm run storybook` to view.
- Tests use Vitest. Run `npm run test` before submitting.
