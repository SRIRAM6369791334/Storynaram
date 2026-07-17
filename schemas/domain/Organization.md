# Organization

**File:** `Organization.schema.json`

**Purpose:** Defines an organization with hierarchy, membership, beliefs, and affiliations.

**Referenced Template:** `templates/domain/Organization.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (guild, order, faction, government, military, religious, academic, trade, secret-society, political, mercenary, criminal, cultural, other); `membershipCount` minimum 0

**Validation Notes:** `entity` block requires `type`. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `headquarters` (Location), `leader` (Character), `members` (Character), `allies`/`enemies` (Organization), `locations` (Location)
