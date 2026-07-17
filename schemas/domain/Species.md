# Species

**File:** `Species.schema.json`

**Purpose:** Defines a species with classification, biology, abilities, and societal traits.

**Referenced Template:** `templates/domain/Species.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (humanoid, beast, avian, aquatic, reptilian, insectoid, plant, elemental, celestial, infernal, undead, construct, other); `classification` enum (sentient, semi-sentient, non-sentient, magical, divine)

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `language` (Language), `homeland` (Location), `subspecies` (Race)
