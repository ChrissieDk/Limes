---
name: skill-craft
description: Forge effective agent skills with clear triggers, progressive disclosure, and bundled resources that other agents can use without confusion. Use when creating, writing, or improving skills, or building reusable agent capabilities.
---

# Skill-Craft

## The Iron Law

A skill's description is the only thing an agent sees when deciding to load it. If the description is vague, the skill is invisible. Specific triggers make skills discoverable.

---

## The Process

### 1. Gather

- What task or domain?
- What specific use cases?
- Need scripts, references, assets?
- What triggers should activate it?

### 2. Structure

```
skill-name/
├── SKILL.md              # Required. Frontmatter + instructions
├── references/           # Optional. Detailed docs loaded on demand
│   └── topic.md
├── scripts/              # Optional. Deterministic executable code
│   └── helper.py
└── assets/               # Optional. Templates, boilerplate
    └── template.html
```

### 3. Write SKILL.md

**Frontmatter:**
```yaml
---
name: skill-name
description: What it does. Use when [specific triggers].
---
```

**Description rules:**
- Max 1024 characters
- First sentence: what it does
- Second: "Use when [triggers]"
- Include keywords, file types, contexts

**Body:**
- Under 500 lines
- Imperative voice throughout
- Concise over verbose
- Examples over explanations
- Checklists for multi-step workflows

### 4. Progressive Disclosure

Three levels:
1. **Metadata** (name + description) - always in context (~100 words)
2. **SKILL.md body** - loaded when triggered (<5k words)
3. **Bundled resources** - loaded as needed (unlimited)

**Pattern: Core + References**
```markdown
## Quick start
[Minimal example]

## Advanced
- Feature A: See [references/a.md](references/a.md)
- Feature B: See [references/b.md](references/b.md)
```

### 5. Validate

- [ ] Description has clear triggers ("Use when...")
- [ ] Under 500 lines
- [ ] No time-sensitive info
- [ ] Consistent terminology
- [ ] Concrete examples
- [ ] References one level deep
- [ ] Scripts tested if included
- [ ] No README, CHANGELOG, or auxiliary docs

---

## Degrees of Freedom

| Level | When to Use |
|-------|-------------|
| High (text instructions) | Multiple valid approaches, context-dependent |
| Medium (pseudocode/scripts with params) | Preferred pattern, some variation OK |
| Low (specific scripts, few params) | Fragile operations, consistency critical |

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| "Helps with documents" | Agent cannot distinguish from other skills | Specific triggers + file types |
| Explaining what agent knows | Wastes context window | Only non-obvious procedural knowledge |
| Missing triggers | Skill never loads | "Use when" is mandatory |
| Deep reference nesting | Agent cannot find | One level deep from SKILL.md |
| Auxiliary docs | Clutter + confusion | No README, CHANGELOG, etc. |

---

## Field Notes

- The description is your skill's billboard. Invest in it.
- Scripts beat generated code for deterministic operations. They save tokens and reduce bugs.
- 500 lines is the ceiling, not the target. Shorter is better.
- Agent reads metadata for ALL skills. Keep it tight. Details go in references.
