# World

**File:** `World.schema.json`

**Purpose:** Defines a world setting including cosmology, geography, history, and major inhabitants.

**Referenced Template:** `templates/domain/World.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (primary, alternate, parallel, pocket, dream, afterlife, celestial)

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `majorLocations` (Location), `countries` (Country), `kingdoms` (Kingdom), `cities` (City), `organizations` (Organization), `cultures` (Culture), `religions` (Religion), `languages` (Language), `magicSystem` (Magic)
