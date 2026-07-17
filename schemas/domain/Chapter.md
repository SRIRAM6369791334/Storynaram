# Chapter

**File:** `Chapter.schema.json`

**Purpose:** Defines a chapter within a book with scene references and timeline positioning.

**Referenced Template:** `templates/domain/Chapter.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `number` minimum 1; `wordCount` minimum 0

**Validation Notes:** `entity` block requires `bookId` and `number`. `unevaluatedProperties` is false.

**Cross-Entity References:** `bookId` (Book), `partId` (Part), `scenes` (Scene), `locations` (Location)
