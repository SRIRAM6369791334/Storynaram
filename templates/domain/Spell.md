# Spell Template

**File:** `Spell.template.json`

**Purpose:** Defines a single magical incantation, effect, or supernatural ability within a magic system.

**Inheritance:** BaseEntity → Spell

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseExtension

**Required Components:** identifier, metadata, audit, magicId

**Optional Components:** school, element, tier, incantation, gesture, components, effect, duration, range, area, requirements, sideEffects, cooldown

**Relationships:** 1:1 Magic (composition)

**Validation Rules:** prefix must be `spl`, magicId must reference a valid Magic entity, tier must be non-negative integer

**Future Extensions:** Spell combo and synergy detection, mana cost calculation from spell parameters
