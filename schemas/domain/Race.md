# Race

**File:** `Race.schema.json`

**Purpose:** Defines a race or ethnicity within a species with cultural and biological traits.

**Referenced Template:** `templates/domain/Race.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (ethnic, subspecies, clan, tribe, bloodline, other); `population` minimum 0

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `speciesId` (Species), `culture` (Culture), `language` (Language), `homeland` (Location), `notableFigures` (Character)
