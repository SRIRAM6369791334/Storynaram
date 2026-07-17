# Magic

**File:** `Magic.schema.json`

**Purpose:** Defines a magic system with source, rules, schools, elements, and limitations.

**Referenced Template:** `templates/domain/Magic.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (arcane, divine, nature, ritual, inherent, techno, blood, chaos, elemental, other)

**Validation Notes:** `entity` block requires `type`. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `spells` (Spell), `practitioners` (Character)
