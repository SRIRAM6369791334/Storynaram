# Canon

**File:** `Canon.schema.json`

**Purpose:** Defines a canon track with status, authority, decisions, and inconsistency records.

**Referenced Template:** `templates/domain/Canon.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (primary, alternate, retconned, deleted, side, expanded, fan, draft); `status` enum (active, superseded, retconned, archived)

**Validation Notes:** `entity` block requires `type`. `unevaluatedProperties` is false.

**Cross-Entity References:** `entities` (any domain entity), `events` (TimelineEvent), `relatedCanons` (Canon)
