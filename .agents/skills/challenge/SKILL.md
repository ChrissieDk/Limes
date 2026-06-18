---
name: challenge
description: Socratic interrogation of plans and decisions. Walk every branch of the decision tree until all dependencies resolve. Use when stress-testing a plan, validating a design, exploring edge cases, or resolving decision dependencies.
---

# Challenge

## The Iron Law

A plan that survives questioning is a plan worth executing. A plan that collapses under questioning just saved you from building the wrong thing.

---

## The Protocol

One question at a time. Wait for the answer. Explore the codebase first if code can answer the question.

Provide a recommendation with each question - do not just ask, guide.

---

## The Five Axes

### Axis 1: Goal Clarity
- What problem are we solving, for whom?
- How will we know this succeeded?
- What happens if we do not do this?

### Axis 2: Constraint Boundary
- What constraints are hard (immovable) vs soft (negotiable)?
- What resources exist (time, people, budget)?
- What must we NOT break or change?

### Axis 3: Dependency Mapping
- What must be true before this starts?
- What does this block if delayed?
- What external dependencies exist (teams, APIs, approvals)?

### Axis 4: Alternative Exploration
- What other approaches were considered?
- Why was this chosen over alternatives?
- What would make us change our minds?

### Axis 5: Edge Case Stress
- What happens in the failure path?
- What happens at 10x scale?
- What if X and Y occur simultaneously?
- What assumptions might not hold?

### Axis 6: Implementation Realism
- Has anything similar been done in this codebase before?
- What parts are uncertain or risky?
- What is the smallest slice that validates the approach?

---

## The End

Session ends when:
- All dependencies resolved
- All edge cases have defined behavior
- Clear next steps identified
- No open questions that would block implementation

Provide summary: decisions made, open items, recommended next steps.

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Multiple questions at once | User answers the easy one, ignores the rest | One at a time |
| No recommendation | Pure interrogation feels hostile | Guide with recommended answer |
| Skip implementation realism | Plan sounds good but cannot be built | Axis 6 is the reality check |
| No summary | Knowledge lost between sessions | End with decisions + next steps |

---

## Field Notes

- The goal of challenging is not to destroy the plan. It is to forge it.
- Axis 5 (edge cases) finds the most expensive bugs before they ship.
- Axis 3 (dependencies) is where projects die. Map them ruthlessly.
- A plan that cannot answer Axis 6 (implementation realism) is a fantasy.
