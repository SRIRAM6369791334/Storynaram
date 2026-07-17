# Vehicle Template

**File:** `Vehicle.template.json`

**Purpose:** Defines any mode of transportation, vessel, or conveyance for travel and combat.

**Inheritance:** BaseEntity → Vehicle

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type

**Optional Components:** worldId, owner, crew, capacity, speed, weapons, defenses, propulsion, size, material, condition, history

**Relationships:** M:M Character, M:M Location

**Validation Rules:** prefix must be `veh`, type must be one of defined enum, condition must be 0–100

**Future Extensions:** Vehicle-to-vehicle combat simulation, crew position and role assignment tracking
