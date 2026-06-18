---
name: domain-grill
description: Interrogate a plan against the project's domain language until every ambiguity is dead. Sharpen terminology, resolve contradictions, update CONTEXT.md and ADRs inline. Use when stress-testing a design, aligning on terminology, or refining architecture before a single line of implementation code.
---

# Domain Grill

## The Iron Law

If you cannot name it precisely, you cannot build it correctly. Ambiguity in language becomes ambiguity in code.

---

## The Interrogation

One question at a time. Wait for the answer. If the codebase can answer the question, explore the code instead of asking.

### Phase 1: Orient

Before grilling, map the documentation landscape:

```
Single context:              Multiple contexts:
/                            /
├── CONTEXT.md               ├── CONTEXT-MAP.md
├── docs/adr/                ├── src/
│   ├── 0001-decision.md     │   ├── domain-a/CONTEXT.md
│   └── 0002-decision.md     │   └── domain-b/CONTEXT.md
└── src/
```

Create files lazily - only when you have resolved content to write.

### Phase 2: Fire Questions (rotate categories)

**Category A: Terminology Collisions**
> "Your glossary defines 'cancellation' as X, but you are describing Y. Which is it?"

**Category B: Edge Case Torture**
> Invent scenarios that stress-test domain boundaries. Force precision about relationships between concepts. "What happens when X and Y occur simultaneously?"

**Category C: Code Reality Check**
> Cross-reference claims with actual code. "Your code cancels entire Orders, but you said partial cancellation is possible. The code wins."

**Category D: Dependency Mapping**
> Walk constraints one-by-one. Identify hidden coupling between decisions that seem independent.

**Category E: Trade-off Archaeology**
> For each decision: what alternatives were rejected and why? Only record as ADR if three conditions hold:
> 1. Hard to reverse
> 2. Surprising without context
> 3. Result of a real trade-off (not just "we picked the obvious choice")

### Phase 3: Document in Real-Time

**CONTEXT.md updates:** Capture resolved terms immediately. Keep it a glossary - definitions only. No implementation, no specs, no scratch pads.

Format:
```
## Term Name

Precise definition with boundaries. What it is and what it is not.
```

**ADR creation:** Offer an ADR only when a load-bearing rejection reason emerges - something a future explorer needs to avoid re-suggesting the same thing. Skip ephemeral reasons ("not worth it right now") and self-evident ones.

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Batch documentation updates | Terms get lost, context fades | Update CONTEXT.md inline, immediately |
| CONTEXT.md as spec dump | Glossary becomes unreadable | Definitions only. No implementation. |
| ADR for every decision | Documentation bloat | Only irreversible, surprising, debated decisions |
| Accept vague language | Ambiguity becomes buggy code | Demand precision every time |
| Skip code reality check | Plan diverges from implementation | Verify claims against actual code |

---

## Field Notes

- The user's domain knowledge beats your inference. Show hypotheses; let them re-rank.
- CONTEXT.md is a contract, not a notebook. Keep it clean.
- A term that takes 10 minutes to resolve saves 10 hours of wrong implementation.
- If the code contradicts the user, the code is the truth until proven otherwise.
