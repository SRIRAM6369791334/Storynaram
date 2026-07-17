# Quest

**File:** `Quest.schema.json`

**Purpose:** Defines a quest with objectives, stages, participants, and fail conditions.

**Referenced Template:** `templates/domain/Quest.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (main, side, personal, faction, world, character-arc, episodic); `difficulty` enum (trivial, easy, medium, hard, deadly, impossible)

**Validation Notes:** `entity` block requires `type`. `unevaluatedProperties` is false.

**Cross-Entity References:** `bookId` (Book), `giver` (Character), `participants` (Character), `stages` (Mission), `relatedQuests` (Quest)
