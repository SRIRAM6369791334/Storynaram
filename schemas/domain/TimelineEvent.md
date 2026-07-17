# TimelineEvent

**File:** `TimelineEvent.schema.json`

**Purpose:** Defines a specific event on a timeline with participants, causes, and consequences.

**Referenced Template:** `templates/domain/TimelineEvent.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (major, minor, catalyst, climax, resolution, background); `significance` minimum 0, maximum 100

**Validation Notes:** `entity` block requires `date` and `timelineId`. `unevaluatedProperties` is false.

**Cross-Entity References:** `timelineId` (Timeline), `participants` (Character), `locations` (Location), `relatedEvents` (TimelineEvent), `sources` (Document)
