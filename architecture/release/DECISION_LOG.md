# RC1 Decision Log

## Decision 1: Freeze Architecture at v2.0 RC1

**Date:** 2026-07-17
**Decision:** Freeze all schema and architecture changes. Declare Release Candidate 1.
**Rationale:** All planned phases complete. No critical issues. Platform score 94/100.
**Impact:** No further schema changes until Phase 4 identifies runtime requirements.

## Decision 2: Core Schemas without unevaluatedProperties

**Date:** 2026-07-17
**Decision:** Core schemas (23 base schemas) intentionally omit `unevaluatedProperties: false`.
**Rationale:** Core schemas are composable partials meant to be combined via allOf. Adding unevaluatedProperties would break composition. Only standalone schemas (domain, AI, workflow, validation) need it.
**Confirmed:** Intentional design, not technical debt.

## Decision 3: 27 Schemas missing title field

**Date:** 2026-07-17
**Decision:** Accept as non-critical technical debt (TD-001). Do not block RC1.
**Rationale:** Title is optional in JSON Schema. Missing title does not affect validation, only tooling display. Schemas are fully functional.
**Action:** Track in TECHNICAL_DEBT.md. Address in v1.1.0.

## Decision 4: Template/Schema Parity

**Date:** 2026-07-17
**Decision:** 121 templates vs 118 schemas is acceptable. 3 extra templates (BaseExport, BaseImport, BaseIndex) are Phase 1 artifacts not included in schema scope.
**Rationale:** Schema framework covers schemas/templates defined in Phases 2-3. Phase 1 templates were informational only.
**Impact:** No action needed.

## Decision 5: Release Channel

**Date:** 2026-07-17
**Decision:** RC1 (Release Candidate) channel. Not General Availability until Phase 4 validates schemas against runtime implementation.
**Rationale:** Schemas are designed and validated but not yet proven against real runtime traffic. RC1 status allows for corrections during Phase 4.

## Decision 6: Version Strategy

**Date:** 2026-07-17
**Decision:** All 5 schema categories versioned independently at v1.0.0. Future MAJOR bumps per category only when breaking changes occur in that category.
**Rationale:** Independent versioning allows domain schemas to evolve without forcing core, AI, workflow, or validation bumps.
