# Document

**File:** `Document.schema.json`

**Purpose:** Defines an in-world document with author, content, format, and accessibility.

**Referenced Template:** `templates/domain/Document.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (note, letter, journal, scroll, tome, map, treaty, law, prophecy, research, manuscript, report, contract, other); `format` enum (physical, digital, magical, oral); `accessibility` enum (public, restricted, secret, lost)

**Validation Notes:** `entity` block requires `type`. `unevaluatedProperties` is false.

**Cross-Entity References:** `author` (Character), `language` (Language), `location` (Location), `owner` (Character)
