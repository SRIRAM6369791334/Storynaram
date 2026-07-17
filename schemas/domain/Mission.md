# Mission

**File:** `Mission.schema.json`

**Purpose:** Defines a mission within a quest with specific objectives and success criteria.

**Referenced Template:** `templates/domain/Mission.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (investigation, combat, diplomacy, stealth, rescue, retrieval, escort, assassination, reconnaissance, delivery, other); `difficulty` enum (trivial, easy, medium, hard, deadly)

**Validation Notes:** `entity` block requires `questId`. `unevaluatedProperties` is false.

**Cross-Entity References:** `questId` (Quest), `assignedBy` (Character), `assignedTo` (Character), `location` (Location)
