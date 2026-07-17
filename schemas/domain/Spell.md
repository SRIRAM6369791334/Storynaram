# Spell

**File:** `Spell.schema.json`

**Purpose:** Defines a spell with incantation, components, effects, and casting requirements.

**Referenced Template:** `templates/domain/Spell.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `tier` minimum 0

**Validation Notes:** `entity` block requires `magicId`. `unevaluatedProperties` is false.

**Cross-Entity References:** `magicId` (Magic)
