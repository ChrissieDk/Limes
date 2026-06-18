---
name: refactor
description: Hunt architectural friction, extract deep modules from shallow ones, and transform coupling into seams. Use when improving architecture, consolidating modules, making code testable, or reducing the cost of change.
---

# Refactor

## The Iron Law

A module's value is measured by what disappears when you delete it. If complexity just moves to callers, the module was shallow. If complexity vanishes, it was deep.

---

## Core Vocabulary

| Term | Definition |
|------|------------|
| Module | Anything with an interface + implementation (function, class, package) |
| Interface | Everything a caller must know: types, invariants, errors, ordering |
| Depth | Much behavior behind a small interface. Deep = high leverage. |
| Seam | Where an interface lives; behavior can change without editing in place |
| Adapter | Concrete thing satisfying an interface at a seam |

### The Deletion Test

Imagine deleting the module:
- Complexity **vanishes** -> deep module, earned its keep
- Complexity **reappears across N callers** -> shallow pass-through, candidate for deepening

### The Adapter Rule
- One adapter = hypothetical seam (may not survive)
- Two adapters = real seam (worth the interface cost)

---

## The Hunt

### Phase 1: Reconnaissance

Read CONTEXT.md and relevant ADRs first. Then explore organically:

- Where must you bounce between 5+ small modules to understand one concept?
- Where is the interface nearly as complex as the implementation?
- Where are pure functions extracted "for testability" while real bugs hide in calling code?
- Where do tightly-coupled modules leak implementation details across seams?
- What parts are untested or can only be tested through integration nightmares?

Apply the deletion test to suspects.

### Phase 2: Present Targets

Numbered list of deepening opportunities per target:
- **Files** - modules involved
- **Friction** - what the current architecture costs you
- **Deepening** - what changes, in plain English
- **Payoff** - in terms of leverage, locality, and testability

Use CONTEXT.md vocabulary for domain terms. Mark ADR conflicts: *"Contradicts ADR-0007 - worth reopening because..."*

Do NOT propose interfaces yet. Ask: "Which target do you want to scope?"

### Phase 3: Scope the Surgery

Once picked, grill through the design:
- What constraints are immovable?
- What shape does the deepened module take?
- What hides behind the seam?
- Which existing tests survive? Which die?

### Phase 4: Execute Safely

1. Add the new interface/seam
2. Migrate callers **one at a time**
3. Remove old code **only after** all callers migrated
4. Run full test suite after every step

Never delete old code before new code is proven. Never refactor red.

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Propose interfaces before buy-in | Solution without agreed problem | Present targets, let user pick |
| Big-bang refactor | High risk, no rollback path | Incremental, caller-by-caller |
| Delete old code early | No escape hatch | Prove new code first, then delete |
| Refactor while red | Compound breakage | Green only |
| Ignore ADRs | Re-litigate settled decisions | Reference or flag conflicts |

---

## Field Notes

- Deep modules are the goal. Small interfaces, complex implementations, simple tests.
- Two adapters prove a seam. One adapter is speculation.
- Use the user's domain language from CONTEXT.md. Call it "Order intake" not "FooBarHandler."
- The friction you feel reading code is real. Trust it. Name it. Fix it.
