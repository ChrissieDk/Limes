---
name: triage
description: Route issues through a state machine with clear ownership, priority, and next actions. No ticket should sit in limbo. Use when organizing backlogs, prioritizing work, assigning issues, or processing incoming tickets.
---

# Triage

## The Iron Law

An issue without a state label and an owner is invisible work. Invisible work does not get done.

---

## The States

| State | Meaning | Who Acts |
|-------|---------|----------|
| needs-triage | Unexamined | Triage agent |
| ready-for-agent | Clear requirements, can start | Any agent |
| needs-info | Missing information | Reporter (agent requests) |
| needs-design | Requires architectural decision | HITL session |
| blocked | External dependency | Monitor + escalate if stale |
| in-progress | Being worked | Worker |
| in-review | PR ready, needs review | Reviewer |
| done | Complete | Close it |

Every open issue must have exactly one state label.

---

## The Protocol

### For Each New Issue

1. **Read** - Full issue, comments, linked PRs
2. **Classify** - Apply labels:
   - Type: `bug`, `feature`, `debt`, `docs`, `spike`
   - Priority: `p0-critical`, `p1-high`, `p2-medium`, `p3-low`
   - Domain: use CONTEXT.md vocabulary (e.g., `domain:orders`)
3. **Dedupe** - Search for similar issues. Link if found.
4. **Assess**:
   - Clear repro steps? -> `ready-for-agent`
   - Missing context? -> `needs-info`
   - Architectural uncertainty? -> `needs-design`
   - External dependency? -> `blocked`
5. **Assign** - Route to owner by domain label

### Priorities

| Level | Trigger |
|-------|---------|
| p0-critical | Production incident, data loss, security vulnerability, release blocker |
| p1-high | Significant user impact, promised feature, performance regression |
| p2-medium | Important not urgent, improvement |
| p3-low | Cosmetic, speculative, low user value |

### Bulk Triage

For backlog cleanup:
1. Sort by age (oldest first)
2. Close stale: no activity 90 days + no owner = close
3. Re-prioritize by current project phase
4. Ensure every open issue has exactly one state label

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Multiple state labels | Confusion about actual state | Exactly one state label per issue |
| No owner | Work falls through cracks | Every open issue has an owner |
| Everything p1 | No prioritization = no prioritization | Be ruthless about p0/p1 criteria |
| Stale issues accumulate | Backlog becomes unmanageable | Close or re-triage monthly |
| No dedup check | Duplicate work | Always search before classifying |

---

## Field Notes

- needs-triage is a temporary state, not a destination. Process it immediately.
- p0 means "drop everything." If everything is p1, nothing is p1.
- The backlog is not a graveyard. Close stale issues aggressively.
- A blocked issue without an unblock date is a forgotten issue. Set a check-in date.
