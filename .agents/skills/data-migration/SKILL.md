---
name: data-migration
description: Execute schema changes and data transformations with zero downtime, safe rollback, and data integrity verification. Use when changing database schema, migrating data between systems, adding tables/columns, or bulk data transformations.
---

# Data Migration

## The Iron Law

A migration without a tested rollback plan is a point of no return. Every migration must be reversible until proven otherwise.

---

## Migration Types

| Type | Approach | Risk |
|------|----------|------|
| Additive schema | Add column/table, deploy code | Low |
| Destructive schema | Multi-step: add -> migrate -> remove | High |
| Data transformation | Batch script, idempotent | Medium |
| Cross-system | Dual-write -> verify -> cutover | High |
| DB upgrade | Blue/green or replica promotion | High |

---

## Additive Schema Pattern

```
1. Migration: Add new column/table (nullable, with defaults)
2. Deploy: Code writes to both old and new
3. Migration: Backfill data if needed
4. Deploy: Code reads from new
5. Migration: Make NOT NULL if applicable
6. Deploy: Remove old column reads
7. Migration: Drop old column
```

## Destructive Schema Pattern

Never drop before removing all reads:
```
1. Migration: Add replacement column
2. Deploy: Write to both, read from old
3. Migration: Backfill new from old
4. Deploy: Read from new, keep writing both
5. Deploy: Stop writing old
6. Migration: Drop old (after verification period)
```

## Data Transformation Pattern

Idempotent batch processing:
- Process in small batches (100-1000 rows)
- Log progress
- Handle errors per-record (do not fail entire batch)
- Transaction per batch, not entire migration
- Always idempotent: re-running must be safe

---

## Verification

Before declaring complete:
- [ ] Row counts match (source vs target)
- [ ] Sample data verified (random sampling)
- [ ] Application reads successfully
- [ ] No errors in logs
- [ ] Performance baseline maintained

---

## Kill Zones

| Anti-Pattern | Why It Dies |
|-------------|-------------|
| Destructive change in one step | No rollback possible | Multi-step with verification at each |
| No rollback plan | Point of no return | Tested rollback before executing |
| Non-idempotent transforms | Re-running corrupts data | Idempotent by design |
| No verification | Silent data corruption | Count + sample + application test |
| Big-bang transform | Long transactions, lock contention | Small batches |

---

## Field Notes

- The 7-step additive pattern looks slow. It is. It is also the only safe way.
- Destructive changes are the highest-risk operations you can perform. Treat them accordingly.
- Idempotent transforms are insurance. You will need to re-run. Make it safe.
- Verification is not optional. Silent data corruption is worse than downtime.
