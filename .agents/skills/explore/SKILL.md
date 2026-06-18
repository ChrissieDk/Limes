---
name: explore
description: Map unfamiliar codebases fast. Build mental models, trace data flows, identify seams, and find where to make changes. Use when entering a new codebase, understanding a feature, or finding the right place to cut.
---

# Explore

## The Iron Law

You cannot modify what you do not understand. Understanding comes from tracing complete paths, not reading files in isolation.

---

## Three Modes

### Mode A: Top-Down (Architecture First)
When you need the big picture:

1. Read entry points (main, index, app startup)
2. Map top-level directories and purposes
3. Find routing/dispatch layer
4. Trace one complete request end-to-end
5. Identify core domain modules vs infrastructure glue

### Mode B: Bottom-Up (Feature First)
When you need to understand one specific thing:

1. Find the user-facing entry point (route, handler, UI component)
2. Trace data flow backward to sources
3. Map every module in the flow
4. Identify state management and side effects
5. Find related tests for behavioral understanding

### Mode C: Dependency Map
When planning changes:

1. Identify the target module
2. Find all importers (who depends on this?)
3. Find all imports (what does this depend on?)
4. Map the dependency graph
5. Identify cycles and coupling hotspots

---

## The Five Questions

Every exploration must answer:
1. **Where is the domain logic?** (vs framework glue, infrastructure)
2. **How does data flow?** (request -> validate -> logic -> persist -> respond)
3. **Where are the seams?** (interfaces you can extend or replace)
4. **What are the invariants?** (rules that must always hold)
5. **Where are the tests?** (what is tested, what is not, test quality)

---

## Output Format

```markdown
## Overview
One-paragraph summary.

## Module Map
| Module | Purpose | Key Files |
|--------|---------|-----------|
| X | ... | ... |

## Data Flow
[Entry] -> [Step 1] -> [Step 2] -> [Exit]

## Seams
- Interface A at file.js:45
- Interface B at other.js:120

## Recommendations
What to look at next or where to cut.
```

Use domain glossary vocabulary throughout.

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Read files in isolation | No understanding of relationships | Trace complete paths |
| Skip the tests | Tests reveal intent better than code | Always check related tests |
| No output format | Knowledge evaporates | Produce the structured report |
| Assume file names are accurate | Legacy cruft accumulates | Verify with content, not paths |

---

## Field Notes

- One complete request trace teaches more than 20 files read in isolation.
- Tests are the best documentation of intent. Read them.
- Domain logic hides in unexpected places. Frameworks obscure it.
- The dependency graph reveals where changes will hurt. Map it before cutting.
