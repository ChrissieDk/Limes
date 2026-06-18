---
name: handoff
description: Compact session state into a document so the next agent picks up where you left off without context loss. Use when ending a session, switching agents, parking work, or transitioning context.
---

# Handoff

## The Iron Law

A handoff that duplicates what is already in commits, issues, or PRDs is waste. Reference existing artifacts. Capture only what a fresh agent needs to continue.

---

## Full Handoff

```markdown
# Handoff: Topic
Date: timestamp
Context: What the next session focuses on

## Completed
- What was done
- Key decisions made
- Files changed (with commit SHAs if committed)

## Current State
- What is partially done
- Active blockers or questions
- Active branches, open PRs

## Next Steps
- Priority-ordered list
- Suggested skills to use
- Estimated complexity per item

## Key Context
- Domain knowledge from the session
- Gotchas or non-obvious findings
- Links to docs, issues, ADRs

## References
- PRD path (if exists)
- Issue numbers
- ADR references
- Commit SHAs
- Prototype locations
```

## Minimal Handoff

For quick context switches (< 1 minute):

```
Topic: one line
Done: 3 bullets max
Next: top priority
Blocker: if any
```

---

## Rules

- Do NOT duplicate content in PRDs, ADRs, issues, or commits
- Reference artifacts by path or URL
- Include only what a fresh agent needs
- Suggest relevant skills for the next session
- Save to persistent location (repo path, issue comment, shared doc)

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Duplicate existing docs | Waste of context window | Reference, do not duplicate |
| No suggested skills | Next agent guesses | Recommend relevant skills |
| Missing current state | Next agent rediscovers blockers | State + blockers are critical |
| Ephemeral storage | Handoff lost | Save to persistent location |

---

## Field Notes

- The next agent knows nothing. The handoff is their only lifeline.
- Minimal > nothing. If full handoff takes too long, do minimal.
- Suggesting the right skills saves more time than any prose.
- References with paths beat descriptions every time.
