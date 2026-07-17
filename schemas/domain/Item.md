# Item

**File:** `Item.schema.json`

**Purpose:** Defines a general item with category, material, value, and crafting details.

**Referenced Template:** `templates/domain/Item.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `category` enum (weapon, armor, artifact, tool, consumable, clothing, jewelry, book, key, food, material, currency, miscellaneous); `durability` minimum 0, maximum 100; `magical` boolean default false

**Validation Notes:** `entity` block requires `category`. `unevaluatedProperties` is false.

**Cross-Entity References:** `owner` (Character), `location` (Location), `crafting.creator` (Character)
