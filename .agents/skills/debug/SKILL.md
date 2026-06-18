---
name: debug
description: Ruthless bug-hunting protocol with a six-phase kill chain from reproduction through prevention. Use when something breaks, crashes, flakes, slows down, or behaves weird. Also for production incidents and performance regressions.
---

# Debug

## The Iron Law

Without a fast, deterministic feedback loop, you are not debugging. You are divining.

A 2-second reliable loop beats 30 minutes of code staring every single time. Build the loop first. Everything else is just consuming it.

---

## The Kill Chain

### Phase 1: Forge the Loop

Construct a pass/fail signal the agent can run repeatedly. Try in this order:

| Priority | Method | When to Use |
|----------|--------|-------------|
| 1 | Failing test at nearest seam | Any testable surface |
| 2 | HTTP script against dev server | API bugs |
| 3 | CLI with fixture + snapshot diff | Data transforms |
| 4 | Headless browser assertion | UI interaction bugs |
| 5 | Replay captured trace | Production incidents |
| 6 | Throwaway harness | Complex subsystem isolation |
| 7 | Property/fuzz loop | Nondeterministic output |
| 8 | Git bisect automation | Regression between known states |
| 9 | Differential dual-run | Version/config comparison |
| 10 | HITL script | Human-required reproduction |

**Loop Quality Gate:** Must be agent-runnable, under 5 seconds, and fail exactly when the bug is present.

**Flaky bugs:** Loop 100x, parallelize, add stress. Raise reproduction rate to 50%+ or it is not debuggable yet.

**Cannot build a loop?** Stop immediately. List attempts. Ask user for: environment access, captured artifact (HAR/core dump/log), or temporary production instrumentation permission. Do not proceed.

### Phase 2: Confirm the Kill

Run the loop. Verify three things:
- Failure matches the user's reported symptom exactly
- Reproduces across multiple runs (or at high flake rate)
- Exact symptom captured (error text, wrong output, timing)

### Phase 3: Generate Kill Hypotheses

Produce 3-5 ranked, falsifiable hypotheses before testing any. Each must state a prediction:

> "If [X is cause], then [changing Y] will [make bug disappear/make it worse]."

Show ranked list to user before testing. They often re-rank instantly with domain knowledge you do not have.

### Phase 4: Instrument with Precision

One probe per hypothesis prediction. Change one variable at a time.

Preference order: Debugger/REPL > targeted logs > "log everything"

Log hygiene: Tag every debug log with `[DEBUG-<id>]` prefix. Cleanup = one grep. Untagged logs survive and pollute forever.

**Performance branch:** Logs lie about performance. Measure first (profiler, timing harness, query plan), fix second.

### Phase 5: Kill and Bury

Regression test before fix, but only at a **correct seam** - one that exercises the real bug pattern as it occurs at the call site. Shallow seams give false confidence.

If no correct seam exists, that IS the finding. The architecture prevents this bug from being locked down. Flag it.

Order: failing test -> watch fail -> apply fix -> watch pass -> re-run original Phase 1 loop.

### Phase 6: Clean the Scene

- [ ] Original repro no longer reproduces
- [ ] Regression test passes (or seam absence documented)
- [ ] All `[DEBUG-...]` instrumentation removed
- [ ] Throwaway prototypes deleted
- [ ] Correct hypothesis stated in commit message

**Then ask: what would have prevented this?** If architecture is the answer, hand off to `/refactor`.

---

## Kill Zones (Anti-Patterns)

| Anti-Pattern | Why It Dies | The Fix |
|-------------|-------------|---------|
| Hypothesize without a loop | You are guessing | Build the loop first |
| Test one hypothesis | Anchoring bias | Generate 3-5 ranked |
| Log everything and grep | Signal drowned in noise | One probe per hypothesis |
| Fix without regression test | Bug returns silently | Test at correct seam first |
| Skip cleanup | Instrumentation rots in codebase | `[DEBUG-*]` grep purge |

---

## Field Notes

- The loop IS the skill. Everything else is mechanics.
- A 50%-flake bug is debuggable. 1% is not. Raise the rate.
- Untagged debug logs are permanent pollution. Tag or do not log.
- The hypothesis that wins belongs in the commit message. The next debugger learns.
