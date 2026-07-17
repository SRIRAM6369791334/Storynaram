# Scene

**File:** `Scene.schema.json`

**Purpose:** Defines a narrative scene with character involvement, dialogue, and timeline position.

**Referenced Template:** `templates/domain/Scene.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `number` minimum 1; `wordCount` minimum 0

**Validation Notes:** `entity` block requires `location` and `timelinePosition`. `unevaluatedProperties` is false.

**Cross-Entity References:** `chapterId` (Chapter), `bookId` (Book), `characters` (Character), `dialogue` (Dialogue), `location` (Location), `plotPoints` (TimelineEvent)
