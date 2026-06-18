---
name: plan-to-issues
description: Slice a plan into vertically-cut issues that can be grabbed and shipped independently. Every slice delivers a complete end-to-end path. Use when converting a plan into tickets, breaking down a PRD, or organizing work into shippable units.
---

# Plan to Issues

## The Iron Law

A vertical slice delivers a narrow but complete path through every integration layer. A horizontal slice delivers one layer of everything and nothing that works.

---

## The Cut

### Types

**AFK** - Agent can implement and merge autonomously. Preferred.

**HITL** - Requires human interaction (architectural decision, design review). Use sparingly.

### Rules

- Each slice is demoable or verifiable on its own
- Thin slices beat thick slices
- HITL slices should come early to unblock AFK work
- Every slice cuts through schema, API, UI, and tests

---

## The Protocol

### 1. Gather

Work from conversation context. If user passes an issue reference, fetch and read it fully.

### 2. Explore (optional)

If codebase is unfamiliar, explore. Use domain glossary vocabulary. Respect ADRs.

### 3. Draft Slices

Numbered list per slice:
- **Title** - short descriptive name
- **Type** - AFK or HITL
- **Blocked by** - which slices must complete first
- **Stories covered** - which user stories this addresses

### 4. Negotiate

Present to user. Ask:
- Is the granularity right?
- Are dependencies correct?
- Any slices to merge or split?
- Are HITL/AFK labels correct?

Iterate until approved.

### 5. Publish in Dependency Order

Publish blockers first so real issue IDs populate "Blocked by" fields in dependent issues.

---

## Issue Template

```markdown
## Parent
Reference to parent issue (omit if none)

## What to Build
Concise end-to-end description. Not layer-by-layer implementation.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Blocked By
- Issue #X (or "None - can start immediately")

## Notes
Prototypes, ADRs, or context for implementers.
```

---

## Dependency Hygiene

Before publishing, verify:
- No circular dependencies
- Critical path is clear and short
- Parallel work is maximized
- HITL slices are early (they unblock AFK work)

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Horizontal slices | "Build all API endpoints" - nothing works alone | Every slice must be demoable end-to-end |
| Too many HITL slices | Human bottlenecks kill velocity | Default AFK, justify HITL |
| Wrong dependency order | Blockers published last | Publish in dependency order |
| No acceptance criteria | Cannot verify completion | Every issue has checkable criteria |

---

## Field Notes

- Thin vertical slices let you ship faster and learn faster.
- HITL slices are expensive. Default AFK. Demand justification for HITL.
- Publish in dependency order. Blockers first. Real issue IDs in "Blocked by."
- A slice that cannot be demoed is not a slice. It is a task.
