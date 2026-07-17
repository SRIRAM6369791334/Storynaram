# Location

**File:** `Location.schema.json`

**Purpose:** Defines a geographical or architectural location with coordinates and hierarchy.

**Referenced Template:** `templates/domain/Location.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (planet, continent, country, kingdom, city, town, village, region, landmark, building, room, natural, ruin, dungeon, other); `population` minimum 0

**Validation Notes:** `entity` block requires `type`. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `parentLocation` (Location), `controlledBy` (Character/Organization), `inhabitants` (Character), `landmarks` (Location)
