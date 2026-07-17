# Armor

**File:** `Armor.schema.json`

**Purpose:** Defines an armor piece with defense rating, material, and enchantments.

**Referenced Template:** `templates/domain/Armor.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (light, medium, heavy, shield, helmet, gloves, boots, cloak, full-plate, chainmail, leather, robe, magical, other); `defense` minimum 0; `durability` 0–100; `magical`/`attunement` boolean default false

**Validation Notes:** `entity` block requires `type`. `unevaluatedProperties` is false.

**Cross-Entity References:** `owner` (Character)
