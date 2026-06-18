---
name: spike
description: Build throwaway experiments to kill uncertainty before it kills your timeline. Validate architectures, de-risk integrations, answer 'will this work?' with evidence instead of opinions. Use when facing a technical bet with irreversible consequences.
---

# Spike

## The Iron Law

Spike when the cost of being wrong exceeds the cost of building a prototype. Never spike when the real implementation is faster than the experiment.

---

## The Three Spikes

### Technical Spike
Validate an integration, algorithm, or approach.

1. Define the question in one sentence: "Can our pipeline process 10k events/sec?"
2. Build minimal code that answers it
3. Measure and record
4. Throw the code away
5. Record the decision

### UI/UX Spike
Explore interaction patterns.

Build multiple radically different variations toggleable from one route. Each variation implements the core interaction with placeholder data. Compare with user: which feels right? Why?

### State Logic Spike
Validate state machines, data flows, or business rules.

Build a runnable terminal app: reads commands from stdin, prints state after each. No UI, no persistence, no network. Validates the state machine behaves correctly.

---

## The Protocol

### Timeboxes

| Complexity | Timebox |
|-----------|---------|
| Single component | 15-30 min |
| Integration | 1-2 hours |
| System-level | Half day |

Stop when the box expires. Partial data beats no data.

### Build Rules (spikes are NOT production code)

- No tests (they slow learning)
- No error handling beyond "don't crash"
- Hardcoded data is fine
- Copy-paste is fine
- TODOs are fine
- It will be thrown away

### Record Findings

Document in PRD, issue, or ADR:
- The question asked
- What worked
- What did not
- The decision
- Relevant snippets that encode decisions (state machines, schemas, type shapes)

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Spike everything | Wastes time on trivial decisions | Only when wrongness is expensive |
| No timebox | Scope creeps into mini-implementation | Set the box, respect the box |
| Keep the spike code | Prototype becomes production | Delete it. Extract insights only. |
| Vague question | Cannot evaluate success | One specific, falsifiable sentence |
| No findings recorded | Knowledge lost | Document decision and evidence |

---

## Field Notes

- The question matters more than the code. A sharp question makes a 15-minute spike valuable.
- Throwaway means throwaway. If you cannot delete it, you built too much.
- State machine spikes in the terminal find logic bugs that UI spikes miss.
- Record the decision, not the code. The code rots; the decision persists.
