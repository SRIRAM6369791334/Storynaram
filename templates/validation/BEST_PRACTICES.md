# Validation Framework — Best Practices

## Rule Design

- **One rule per concern** — Each rule validates exactly one condition. Don't combine multiple checks.
- **Severity honesty** — Critical only for data loss/corruption. High for functional integrity. Medium for policy violations.
- **Recovery strategy** — Every rule must declare a recovery strategy. Never leave "abort" as the only option.
- **Error messages for humans** — Write error messages that tell the user what to fix, not just what's wrong.

## Profile Design

- **Profile per entity type** — Create at least one profile per entity type. Entity types without profiles skip validation.
- **Priority 100 for critical** — Assign priority 100 to profiles that gate publishing or data modification.
- **Strict for production** — Use strict mode for published entities. Use lenient for drafts and works-in-progress.

## Integrity Checks

- **Reference integrity on every write** — Check for orphaned and dangling references every time an entity is written.
- **Bidirectional consistency** — Always verify that relationship A→B has a matching B→A entry.
- **Cycle detection** — Run cycle detection weekly for the relationship graph. Cycles indicate modeling issues.

## AI Validation

- **Always validate AI output** — Never bypass AI validation. Even trusted models produce hallucinations.
- **Threshold tuning** — Start strict (0.9) and relax based on false-positive rate. Aim for <5% false positives.
- **Human-in-the-loop for flags** — When AI validation flags an issue, route to human review, not auto-rejection.

## Performance

- **Cache validation results** — Cache results for immutable entities. Invalidate on entity update.
- **Batch validation** — Validate in batches for bulk operations. Single-entity validation for writes.
- **Profile selection** — Select the minimum profile needed. Don't run AI validation on entity writes.
