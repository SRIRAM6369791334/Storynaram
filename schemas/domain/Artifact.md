# Artifact

**File:** `Artifact.schema.json`

**Purpose:** Defines a unique artifact with tier, powers, curse, and historical significance.

**Referenced Template:** `templates/domain/Artifact.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (weapon, armor, jewelry, tome, relic, tool, instrument, crown, idol, orb, crystal, other); `tier` enum (common, uncommon, rare, epic, legendary, mythic, divine); `attunement` boolean default true

**Validation Notes:** `entity` block requires `type`. `unevaluatedProperties` is false.

**Cross-Entity References:** `originalCreator` (Character), `owners` (Character), `currentLocation` (Location), `destroyedBy` (Character)
