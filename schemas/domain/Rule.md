# Rule

**File:** `Rule.schema.json`

**Purpose:** Defines a worldbuilding rule governing physics, magic, society, or narrative.

**Referenced Template:** `templates/domain/Rule.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (physics, magic, society, legal, natural, divine, meta, gameplay, narrative, other); `scope` enum (universal, world, region, domain, entity, temporal); `severity` enum (absolute, strong, moderate, flexible, suggestion)

**Validation Notes:** `entity` block requires `type` and `scope`. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `conflictingRules`/`relatedRules` (Rule)
