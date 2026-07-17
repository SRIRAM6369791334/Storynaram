# Map

**File:** `Map.schema.json`

**Purpose:** Defines a map with scale, projection, markers, and coordinate grid.

**Referenced Template:** `templates/domain/Map.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (world, continent, region, city, dungeon, star, political, topographic, climate, trade, military, treasure, other)

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `markers[].locationId` (Location), `regions` (Location)
