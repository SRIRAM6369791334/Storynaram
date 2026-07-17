# Ability

**File:** `Ability.schema.json`

**Purpose:** Defines a character ability with type, progression, effects, and restrictions.

**Referenced Template:** `templates/domain/Ability.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (skill, talent, power, technique, knowledge, innate, learned, supernatural); `maxLevel` minimum 1

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `learnedBy` (Character)
