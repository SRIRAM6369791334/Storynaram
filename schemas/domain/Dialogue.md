# Dialogue

**File:** `Dialogue.schema.json`

**Purpose:** Defines a dialogue exchange between speakers with line-level emotion, tone, and subtext.

**Referenced Template:** `templates/domain/Dialogue.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `isMonologue` boolean default false; `isInternalThought` boolean default false

**Validation Notes:** `entity` block requires `speakers` and `lines`. Each line is an object with `speaker`, `text`, `emotion`, `action`, `tone`. `unevaluatedProperties` is false.

**Cross-Entity References:** `sceneId` (Scene), `speakers` (Character), `language` (Language)
