---
name: spec
description: Forge conversation context into a precise, actionable specification. No interviews - synthesize what is already known into a document that eliminates ambiguity before implementation starts. Use when creating a PRD, writing requirements, or formalizing a feature plan.
---

# Spec

## The Iron Law

A specification that requires interpretation during implementation has already failed. Precision now prevents pain later.

---

## The Protocol

### 1. Explore

Understand current codebase state if not already known. Use domain glossary terms. Respect ADRs.

### 2. Identify Modules

Sketch major modules to build or modify. Hunt for deep module opportunities: small interface, complex implementation, testable in isolation.

Confirm with user:
- Module breakdown matches their mental model
- Which modules need tests

### 3. Write the Spec

---

## Spec Template

```markdown
# Spec: Feature Name

## Problem
The user-facing problem. From the user's perspective.

## Solution
The user-facing solution. Not implementation details.

## User Stories
1. As [actor], I want [feature], so that [benefit]
2. ... (exhaustive - cover every aspect)

## Module Design

### Module A
- Purpose: What it does
- Interface: Public API (types, functions, events)
- Responsibilities: What it owns and what it does not
- Tests: Behaviors to verify

### Module B
...

## Data Model
- Entities and relationships
- Schema changes
- Migration requirements

## API Design
- Endpoints or function signatures
- Request/response shapes
- Error scenarios

## Decisions
- Architecture approach
- Technology choices
- Integration patterns
- Performance requirements
- Mark items that should become ADRs (hard-to-reverse decisions)

## Testing Strategy
- What to test (prioritized)
- Test types
- Similar patterns in codebase

## Out of Scope
Explicitly excluded. Prevents scope creep.

## Open Questions
Items needing resolution before implementation.

## Success Criteria
How to verify this spec is correct and complete.
```

---

## Rules

- Domain glossary terms throughout
- No specific file paths or code snippets (they go stale)
- Exception: prototype snippets encoding decisions (state machines, schemas) - trim to decision-rich parts only
- Reference existing ADRs where relevant
- Mark hard-to-reverse decisions for ADR creation

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Interview instead of synthesize | Spec should use known context, not generate new requirements | Synthesize what you know |
| Implementation in the spec | Spec goes stale, implementation changes | Behavior and interfaces only |
| Vague user stories | Cannot verify or implement | Precise actor/feature/benefit |
| No out-of-scope section | Scope creep guaranteed | Explicitly exclude |
| No open questions | Unresolved issues surface mid-implementation | Name them upfront |

---

## Field Notes

- A spec is a contract. Ambiguity is a bug in the spec.
- User stories are exhaustive. Better to have 20 precise stories than 5 vague ones.
- Module interfaces are the most important part. Get them right.
- Out of scope prevents the most expensive words in software: "while we're here..."
