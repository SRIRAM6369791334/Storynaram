# Timeline

**File:** `Timeline.schema.json`

**Purpose:** Defines a chronological timeline with eras, calendar system, and event references.

**Referenced Template:** `templates/domain/Timeline.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (main, alternate, character, world, book)

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `events` (TimelineEvent), `parallelTimelines` (Timeline)
