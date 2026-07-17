# Memory

**File:** `Memory.schema.json`

**Purpose:** Defines a memory entry for characters or AI with importance, recency, and emotional associations.

**Referenced Template:** `templates/domain/Memory.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (character, ai, story, system, canon); `ownerType` enum (character, ai, system, story); `importance` 0–100; `frequency` minimum 0; `accuracy`/`decay` 0.0–1.0; `consolidated` boolean default false

**Validation Notes:** `entity` block requires `type` and `ownerId`. `unevaluatedProperties` is false.

**Cross-Entity References:** `ownerId` (Character/AI/System/Story), `associations` (Memory), `source` (Document/Scene)
