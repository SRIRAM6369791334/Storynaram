# Family

**File:** `Family.schema.json`

**Purpose:** Defines a family bloodline with genealogy, heraldry, alliances, and rivalries.

**Referenced Template:** `templates/domain/Family.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (noble, royal, merchant, artisan, peasant, criminal, magical, other)

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `head` (Character), `members` (Character), `ancestors` (Character), `holdings` (Location), `alliances`/`rivalries` (Family)
