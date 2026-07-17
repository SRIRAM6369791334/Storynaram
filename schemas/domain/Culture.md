# Culture

**File:** `Culture.schema.json`

**Purpose:** Defines a culture with values, traditions, social structure, and customs.

**Referenced Template:** `templates/domain/Culture.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (tribal, feudal, urban, nomadic, seafaring, mountain, desert, forest, underground, academic, martial, trade, other)

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `language` (Language), `religion` (Religion)
