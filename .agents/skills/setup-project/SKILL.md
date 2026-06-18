---
name: setup-project
description: Bootstrap a new project with agent-friendly structure, documentation templates, and conventions that make AI collaboration effective from day one. Use when starting a new project, scaffolding a repo, or configuring a codebase for team collaboration.
---

# Setup Project

## The Iron Law

A project without a domain glossary and documented decisions forces every new agent to reverse-engineer the same knowledge. Write it down once.

---

## The Skeleton

```
project/
├── CONTEXT.md              # Domain glossary - terms and definitions
├── docs/
│   ├── adr/                # Architecture Decision Records
│   ├── agents/             # Agent-specific operational docs
│   │   └── issue-tracker.md # How to interact with issues
│   └── specs/              # Feature specifications
├── src/                    # Source code
├── tests/                  # Tests (mirror src structure)
├── scripts/                # Automation scripts
└── .cursor/                # IDE rules (optional)
```

---

## The Files

### CONTEXT.md
A glossary. Terms and definitions only. No implementation details.

```markdown
# Domain Glossary

## Term Name
Precise definition with boundaries.
```

### docs/agents/issue-tracker.md
How agents interact with your issue tracker:

```markdown
# Issue Tracker

## Workflow
1. Triage: apply state labels
2. Ready: clear requirements
3. In progress: agent working
4. Review: PR submitted
5. Done: merged

## Labels
- State: needs-triage, ready-for-agent, needs-info, in-progress, in-review
- Type: bug, feature, debt, docs, spike
- Priority: p0-critical, p1-high, p2-medium, p3-low
```

### ADR Template
```markdown
# ADR-XXXX: Title

## Context
What forced this decision.

## Decision
What was decided and why.

## Consequences
Positive and negative.

## Status
proposed | accepted | deprecated | superseded
```

### .cursor/rules.mdc (if using Cursor)
```markdown
---
description: Project conventions
glob: "**/*"
---
# Coding Conventions

- Use domain glossary terms from CONTEXT.md
- Follow existing patterns
- Test behavior, not implementation
- Update ADRs for architectural decisions
```

---

## The Checklist

- [ ] Directory structure created
- [ ] CONTEXT.md with initial glossary
- [ ] docs/adr/ directory with template
- [ ] docs/agents/issue-tracker.md with workflow
- [ ] Git initialized with .gitignore
- [ ] README.md with setup instructions
- [ ] Linter and formatter configured
- [ ] CI/CD skeleton (if applicable)

---

## Agent Conventions

1. Clear module boundaries - one responsibility per module
2. Domain vocabulary from CONTEXT.md in code
3. Test seams designed from day one
4. ADRs for decisions, glossary for terms
5. Predictable file organization

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| No CONTEXT.md | Every agent reverse-engineers terminology | Glossary from day one |
| No issue-tracker.md | Agents guess at workflow | Document the triage process |
| ADRs as blog posts | Too long, not scannable | Context + Decision + Consequences |
| Directory by layer | `controllers/`, `models/` - loses cohesion | Organize by domain/feature |

---

## Field Notes

- CONTEXT.md is a contract. Keep it short. Terms and definitions only.
- The issue-tracker.md saves more time than any other single document.
- ADRs deprecate. Mark old ones. Do not delete - history matters.
- Directory by feature > directory by layer. Cohesion beats taxonomy.
