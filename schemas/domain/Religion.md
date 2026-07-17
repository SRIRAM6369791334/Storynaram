# Religion

**File:** `Religion.schema.json`

**Purpose:** Defines a religion with deities, beliefs, practices, clergy, and places of worship.

**Referenced Template:** `templates/domain/Religion.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (monotheistic, polytheistic, pantheistic, animistic, ancestor, philosophical, cult, other)

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `deities` (Character), `prophets` (Character), `holyTexts` (Document), `placesOfWorship` (Location), `followers` (Character/Culture)
