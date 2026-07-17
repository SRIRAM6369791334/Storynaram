# Vehicle

**File:** `Vehicle.schema.json`

**Purpose:** Defines a vehicle with propulsion, crew, capacity, and weapons.

**Referenced Template:** `templates/domain/Vehicle.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (ship, boat, carriage, wagon, airship, flying, submersible, land, space, magical, other); `capacity` minimum 0; `condition` 0–100

**Validation Notes:** `entity` block requires `type`. `unevaluatedProperties` is false.

**Cross-Entity References:** `worldId` (World), `owner` (Character), `crew` (Character), `weapons` (Weapon)
