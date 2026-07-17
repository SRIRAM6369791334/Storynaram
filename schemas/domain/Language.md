# Language

**File:** `Language.schema.json`

**Purpose:** Defines a language with script, grammar, vocabulary, and dialects.

**Referenced Template:** `templates/domain/Language.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (constructed, natural, ancient, dead, trade, ritual, sign)

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `relatedLanguages` (Language), `speakers` (Character/Culture)
