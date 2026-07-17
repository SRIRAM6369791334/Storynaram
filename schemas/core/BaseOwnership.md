# BaseOwnership

**File:** `BaseOwnership.schema.json`

**Purpose:** Ownership and container tracking — identifies who owns an entity and what container it belongs to, with transfer history and permission overrides.

**Referenced Template:** `templates/base/BaseOwnership.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** `ownerType`, `ownerId`

**Key Constraints:** `ownerId` pattern `^[a-z]+_[0-9]{6,}$`; `ownershipType` enum: `exclusive`, `shared`, `temporary`, `inherited`, `referential`. `ownerHistory` records full transfer audit trail. Permission defaults: owner can edit/delete, container cannot.

**Validation Notes:** `containerType`/`containerId` are optional for entities without a parent container.

**Backward Compatibility:** Adding optional fields (`containerType`, `containerId`, `ownershipType`, `ownerHistory`, `permissions`) is non-breaking.
