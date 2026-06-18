---
name: oncall-runbook
description: Create incident response procedures, handle production incidents, and build operational playbooks. Use when creating runbooks, responding to incidents, setting up on-call, documenting operational tasks, or conducting post-incident reviews.
---

# On-Call Runbook

## The Iron Law

The goal of incident response is not to find root cause. It is to stop the bleeding. Mitigate first, investigate second.

---

## Severity Levels

| Level | Name | Response | Examples |
|-------|------|----------|----------|
| SEV1 | Critical | All hands, war room | Complete outage, data loss, security breach |
| SEV2 | Major | Page on-call, escalate | Major feature broken, significant data impact |
| SEV3 | Minor | Ticket, business hours | Partial degradation, workaround exists |
| SEV4 | Low | Track, regular work | Cosmetic, monitoring gap |

---

## Incident Response Protocol

### 1. Acknowledge (2 minutes)
- Acknowledge the alert
- Confirm severity
- SEV1/SEV2: begin incident response

### 2. Assess (5 minutes)
- What is the user-facing impact?
- When did it start? (dashboards, logs)
- What changed recently? (deploys, config, traffic)
- Is there a workaround?

### 3. Mitigate (goal: under 15 minutes)
Priority: stop the bleeding, not root cause.

Options: rollback, feature flag off, scale up, circuit breaker.

Document every action with timestamp.

### 4. Communicate
- SEV1: Status page + stakeholder notification
- SEV2: Internal team notification
- SEV3/SEV4: Ticket with context

### 5. Resolve
- Confirm service restored (monitoring + synthetic check)
- Close incident
- Schedule post-mortem for SEV1/SEV2

---

## Post-Mortem Template

```markdown
# Post-Mortem: Title
Date: <date> | Severity: SEV<N> | Duration: <time>

## Summary
One paragraph: what happened and impact.

## Timeline
- 10:00 - Alert fired
- 10:02 - Acknowledged
- 10:05 - Root cause identified
- 10:12 - Mitigation applied
- 10:15 - Service restored

## Root Cause
The underlying technical cause.

## Impact
- Users affected: N
- Features impacted: X, Y

## What Went Well
- Item 1

## What Went Wrong
- Item 1

## Action Items
| Action | Owner | Due |
|--------|-------|-----|
| Fix X | Name | Date |

## Lessons Learned
```

---

## Runbook Template

```markdown
# Runbook: Alert Name

## Symptoms
- Alert: <name>
- Dashboard: <link>
- Typical error: "..."

## Impact
What user-facing features are affected.

## Diagnosis
1. Check dashboard: <link>
2. Check logs: `query`
3. Check recent deploys: <link>

## Resolution
### Quick fix (mitigation)
Steps to stop the bleeding.

### Full fix
Steps to fully resolve.

## Escalation
- When to escalate: conditions
- Who: team/person
- War room: link
```

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Root cause before mitigation | Users suffer longer | Stop bleeding first |
| No runbook for alerts | Every incident is novel | Every alert has a runbook |
| Blame in post-mortem | Destroys psychological safety | Focus on system improvement |
| No action item tracking | Same incidents repeat | Track to completion |
| Alert fatigue | Pages get ignored | Review fired alerts weekly |

---

## Field Notes

- Mitigation beats investigation every time. Stop the bleeding.
- The first question in any incident: "what is the user-facing impact?"
- Post-mortems are learning opportunities, not blame sessions. No names, no shame.
- Action items that are not tracked are action items that do not happen. Track them.
- Every alert should have a runbook. An alert without a runbook is just noise.
