# BaseReference

**File:** `BaseReference.schema.json`

**Purpose:** Cross-referencing block — internal, external, cross-project, graph, parent, child, and related references with denormalized display data.

**Referenced Template:** `templates/base/BaseReference.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** Internal reference IDs match `^[a-z]+_[0-9]{6,}$`; external URLs must be valid URIs; external `type` enum: `web`, `file`, `api`, `reference`, `source`; graph/related `weight`/`strength` range 0–1.

**Validation Notes:** References are fully optional. Parent is a single object (not array) for composition hierarchy. Cross references span projects/universes.

**Backward Compatibility:** All reference sections are optional and additive.
