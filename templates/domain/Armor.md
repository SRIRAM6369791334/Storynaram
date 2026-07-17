# Armor Template

**File:** `Armor.template.json`

**Purpose:** Defines any protective gear, equipment, or defensive covering for combat.

**Inheritance:** BaseEntity → Armor

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type

**Optional Components:** material, defense, weight, durability, magical, enchantments, requirements, attunement, owner

**Relationships:** 1:1 Item, M:M Character

**Validation Rules:** prefix must be `arm`, type must be one of defined enum, defense must be >= 0, durability must be 0–100

**Future Extensions:** Armor set bonus detection, damage reduction calculation from defense values
