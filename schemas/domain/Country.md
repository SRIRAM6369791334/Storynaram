# Country

**File:** `Country.schema.json`

**Purpose:** Defines a country with government, economy, military, and diplomatic relations.

**Referenced Template:** `templates/domain/Country.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `population` minimum 0

**Validation Notes:** `entity` block requires `worldId`. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `capital` (City), `cities` (City), `languages` (Language), `ruler` (Character), `allies`/`enemies` (Country)
