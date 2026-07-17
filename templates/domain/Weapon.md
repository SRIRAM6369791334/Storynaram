# Weapon Template

**File:** `Weapon.template.json`

**Purpose:** Defines any weapon, armament, or instrument of combat with damage and properties.

**Inheritance:** BaseEntity → Weapon

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type

**Optional Components:** material, damage, damageType, range, weight, speed, durability, magical, enchantments, requirements, attunement, owner, historicalSignificance

**Relationships:** 1:1 Item, M:M Character

**Validation Rules:** prefix must be `wpn`, damageType must be one of defined enum, durability must be 0–100

**Future Extensions:** Weapon proficiency and requirement validation, enchantment stacking rules
