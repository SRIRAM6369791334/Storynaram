# Character

**File:** `Character.schema.json`

**Purpose:** Defines a story character with appearance, biography, personality, and narrative role.

**Referenced Template:** `templates/domain/Character.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `age` minimum 0; `ageCategory` enum (child, teen, young-adult, adult, middle-aged, elder, immortal, unknown); `narrativeRole` enum (protagonist, antagonist, deuteragonist, tritagonist, supporting, minor, foil, love-interest, mentor, sidekick, antagonist-ally, background)

**Validation Notes:** `entity` block requires `appearance`, `biography`, and `personality` objects. `unevaluatedProperties` is false.

**Cross-Entity References:** `affiliations`, `abilities`, `inventory`, `currentLocation`, `books`, `scenes`, `timelineEvents`, `species`, `race`
