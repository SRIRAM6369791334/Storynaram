# Item Template

**File:** `Item.template.json`

**Purpose:** Defines any object, possession, tool, or thing that can be owned or used.

**Inheritance:** BaseEntity → Item

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, category

**Optional Components:** subcategory, material, weight, dimensions, value, condition, durability, magical, magicalProperties, owner, location, history, crafting

**Relationships:** M:M Character, M:M Location, M:M Quest

**Validation Rules:** prefix must be `itm`, category must be one of defined enum, durability must be 0–100 if defined

**Future Extensions:** Inventory management system, item crafting recipe and material requirement tracking
