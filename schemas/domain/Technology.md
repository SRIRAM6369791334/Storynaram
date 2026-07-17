# Technology

**File:** `Technology.schema.json`

**Purpose:** Defines a technology with principles, applications, limitations, and era.

**Referenced Template:** `templates/domain/Technology.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (mechanical, electrical, chemical, biological, industrial, military, communication, transportation, energy, computing, medical, agricultural, other); `tier` minimum 0; `prevalence` enum (widespread, common, uncommon, rare, experimental, lost)

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `inventor` (Character), `relatedTechnologies` (Technology)
