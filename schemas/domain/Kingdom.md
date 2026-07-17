# Kingdom

**File:** `Kingdom.schema.json`

**Purpose:** Defines a kingdom with monarchy, succession rules, heraldry, and territorial holdings.

**Referenced Template:** `templates/domain/Kingdom.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `succession` enum (primogeniture, elective, merit, conquest, appointed, other); `population` minimum 0

**Validation Notes:** `entity` block requires `worldId`. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `countryId` (Country), `capital` (City), `monarch` (Character), `cities` (City), `royalHouse` (Family)
