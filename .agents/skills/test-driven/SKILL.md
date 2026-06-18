---
name: test-driven
description: Build features one vertical slice at a time. Red-green-refactor with integration-focused tests that survive refactoring. Use when building features test-first, fixing bugs with tests, or mentions of TDD, red-green-refactor, or test-first development.
---

# Test-Driven

## The Iron Law

Tests that break during refactoring tested implementation, not behavior. Tests that survive tested the right thing.

---

## Philosophy

Good tests read like specifications: "User can checkout with valid cart." They survive refactors because they exercise public interfaces, not internal structure.

Bad tests mock internals, test private methods, or break when behavior has not changed. If renaming a private function breaks a test, that test was a liability, not an asset.

---

## The Forbidden Pattern: Horizontal Slicing

**WRONG** - Write all tests first, then all implementation:
```
RED:   test1 test2 test3 test4 test5
GREEN: impl1 impl2 impl3 impl4 impl5
```

This produces tests of **imagined** behavior - insensitive to reality, brittle to change.

**RIGHT** - Vertical slices via tracer bullets:
```
RED->GREEN: test1->impl1
RED->GREEN: test2->impl2
RED->GREEN: test3->impl3
```

Each test responds to what the previous cycle taught you. Because you just wrote the code, you know exactly what behavior matters.

---

## The Protocol

### 1. Plan

- [ ] Confirm interface changes with user
- [ ] Identify behaviors to test (prioritized - you cannot test everything)
- [ ] Design interfaces for testability
- [ ] List behaviors, not implementation steps
- [ ] Get approval

### 2. Tracer Bullet

```
RED:  Write one test for one behavior -> test fails
GREEN: Minimal code to pass -> test passes
```

### 3. Incremental Loop

- RED: Write next test -> fails
- GREEN: Minimal code to pass -> passes

Rules: one test at a time, minimal code, no anticipation, observable behavior only.

### 4. Refactor

After green: extract duplication, deepen modules, apply SOLID where natural. Run tests after each step.

**Never refactor while red.**

---

## Mocking Rules

**Mock only external boundaries:** HTTP servers, databases, file system, time, random.

**Never mock:** Internal collaborators, private methods, value objects, data structures.

If you cannot test through the public interface without excessive mocking, the interface needs redesign.

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Horizontal slicing | Tests of imagined behavior | One vertical slice at a time |
| Test private methods | Breaks on every refactor | Public interfaces only |
| Mock internals | Tests implementation, not behavior | Mock boundaries only |
| Refactor while red | Compound breakage | Green first, always |
| Test everything equally | Wasted effort on trivial paths | Focus on critical/complex logic |

---

## Field Notes

- Vertical slices mean you know exactly what behavior matters because you just wrote the code.
- A test that reads like a spec survives. A test that reads like code inspection rots.
- If the only way to test is excessive mocking, your interface is wrong. Fix the design.
- Planning phase: confirm what to test with the user. You cannot test everything. Choose wisely.
