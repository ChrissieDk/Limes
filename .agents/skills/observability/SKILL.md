---
name: observability
description: Set up logging, metrics, traces, and alerts for production systems. Use when configuring observability, adding monitoring, implementing distributed tracing, or creating dashboards and alerts.
---

# Observability

## The Iron Law

If you cannot see what your system is doing right now, you are operating blind. Alerts that wake people up must be actionable. Everything else is noise.

---

## The Three Pillars + One

### Pillar 1: Logs

**Levels:**
| Level | Use For |
|-------|---------|
| ERROR | Failures requiring action |
| WARN | Anomalies, degraded state |
| INFO | Significant business events |
| DEBUG | Detailed diagnostics |

**Structured only (JSON).** Never parse strings.

```json
{
  "timestamp": "2026-01-15T10:30:00Z",
  "level": "INFO",
  "message": "Order created",
  "service": "order-service",
  "trace_id": "abc123",
  "order_id": "ord789",
  "duration_ms": 45
}
```

**Rules:** Include trace_id and context. No sensitive data. Log at service boundaries. Errors include stack traces.

### Pillar 2: Metrics

| Category | Metrics |
|----------|---------|
| Request | Rate, latency (p50/p95/p99), errors (4xx/5xx) |
| Resource | CPU, memory, disk, connections |
| Business | Orders/min, signups/day |
| Dependency | DB latency, cache hit rate, external API latency |

Naming: `service_entity_unit_statistic`
Example: `api_requests_duration_ms_p95`

### Pillar 3: Traces

Every request gets a `trace_id` propagated across services. Key spans: request entry, auth, business logic, DB queries, external calls, cache lookups.

Sampling: dev 100%, production 1-10%.

### The +One: Alerts

| Severity | Response | Example |
|----------|----------|---------|
| P1 (page) | Immediate | Service down, data loss, security |
| P2 (page) | 15 min | Elevated errors, dependency failure |
| P3 (ticket) | 4 hours | Degraded performance |
| P4 (ticket) | 24 hours | Below-target SLO |

**Good alerts** are actionable, specific, threshold-based on SLOs, and tested.
**Bad alerts** ("CPU > 80%" with no user impact) create alert fatigue and get ignored.

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Unstructured logs | Cannot query, cannot correlate | JSON only |
| "Log everything" | Signal drowned in noise | Structured, bounded, purposeful |
| No trace propagation | Cannot follow requests across services | trace_id everywhere |
| Flapping alerts | Wake people up for nothing | Tested thresholds, hysteresis |
| Untargeted pages | Alert fatigue kills response quality | Specific service + symptom |

---

## Field Notes

- An alert that is not actionable is just noise. Noise gets ignored.
- Trace propagation is the difference between "service is slow" and "DB query X on service Y is slow."
- Business metrics (orders/min) matter more than infrastructure metrics (CPU%). Monitor both.
- Alert fatigue is real. Every page that fires unnecessarily erodes trust.
