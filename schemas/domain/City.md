# City

**File:** `City.schema.json`

**Purpose:** Defines a city or settlement with governance, economy, districts, and demographics.

**Referenced Template:** `templates/domain/City.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (capital, city, town, village, hamlet, fortress, port, trade-post, religious, academic); `population` minimum 0

**Validation Notes:** `entity` block requires `worldId`. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `countryId` (Country), `kingdomId` (Kingdom), `notableLocations` (Location), `ruler` (Character), `notableEvents` (TimelineEvent)
