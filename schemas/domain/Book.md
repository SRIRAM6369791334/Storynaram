# Book

**File:** `Book.schema.json`

**Purpose:** Defines a book entity including series structure, narrative style, and canon status.

**Referenced Template:** `templates/domain/Book.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `series.position` minimum 1; `wordCount`/`pageCount` minimum 0; `pointOfView` enum (first-person, second-person, third-person-limited, third-person-omniscient, multiple); `tense` enum (past, present, future, mixed); `narrativeStyle` enum (linear, non-linear, epistolary, frame, stream-of-consciousness, multipov); `canonStatus` enum (primary, side, alternate, deleted)

**Validation Notes:** No required fields at the `entity` block level. `unevaluatedProperties` is false.

**Cross-Entity References:** `structure.chapters`, `structure.parts`, `setting.world`, `genre`
