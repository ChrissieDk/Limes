---
name: performance-tuning
description: Data-driven performance optimization. Profile actual bottlenecks, establish baselines, implement fixes, verify improvement. Use when code is slow, latency is high, throughput is insufficient, or resource usage needs reduction.
---

# Performance Tuning

## The Iron Law

If you did not measure the bottleneck before fixing it, you are not tuning performance. You are rearranging deck chairs.

---

## The Protocol

### 1. Baseline

Before touching anything:
- Define the metric: latency (p50/p95/p99), throughput (RPS), resource (CPU/memory)
- Measure current state under representative load
- Record exact reproduction steps
- Document environment (hardware, data size, concurrency)

### 2. Profile

Identify the actual bottleneck. Not the suspected bottleneck. The actual one.

| Tool Type | Examples | Use For |
|-----------|----------|---------|
| CPU profiler | perf, pprof, clinic.js | Hot methods, compute |
| Memory profiler | heapdump, memwatch | Leaks, allocation |
| Request tracer | OpenTelemetry, Zipkin | Latency per span |
| DB profiler | pg_stat_statements, slow query log | Expensive queries |
| Load tester | k6, vegeta, ab | Throughput, concurrency |

**Rule:** Profile in production-like conditions. Dev profiles lie.

### 3. Hypothesize

Ranked hypotheses about the bottleneck:
- "If N+1 queries are the issue, a join will reduce latency"
- "If CPU-bound, caching helps less than algorithmic improvement"

### 4. Optimize (Hierarchy)

**Level 1 - Algorithmic:** Better Big-O, reduce unnecessary work, early returns.

**Level 2 - Caching:** Result cache, query cache, CDN. Have invalidation strategy.

**Level 3 - Concurrency:** Parallelize independent work, async I/O, connection pooling.

**Level 4 - Data Access:** Missing indexes, N+1 elimination, column selection, batching.

**Level 5 - Architecture:** Read replicas, caching layers, queue-based processing.

Start at Level 1. Only escalate when lower levels are exhausted.

### 5. Verify

- Re-run same benchmark
- Compare against baseline
- Check no regression in other metrics
- Confirm correctness preserved

---

## Symptom Map

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| High p99, low p50 | Tail latency (GC, locks) | Profile tail, reduce contention |
| Slow with more users | Lock contention, pool exhaustion | Increase pools, reduce locks |
| Gradual slowdown | Memory leak | Heap profile, find retention |
| Slow first request | Cold start, JIT | Warmup, eager initialization |
| DB timeout | Missing index, N+1 | Query analysis, add indexes |

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Optimize without profiling | Fix the wrong thing | Measure first, always |
| Premature optimization | Wastes time, adds complexity | Profile proves the bottleneck |
| Optimize in dev | Production data/loads differ | Prod-like conditions |
| Fix one metric, ignore others | Regression in hidden metric | Verify all metrics post-fix |

---

## Field Notes

- The profiler tells the truth. Your intuition does not. Trust the profiler.
- A 10ms optimization in a hot loop beats a 100ms optimization in cold code.
- Caching is easy. Cache invalidation is hard. Have a strategy before caching.
- Level 5 (architecture) changes are expensive. Exhaust levels 1-4 first.
