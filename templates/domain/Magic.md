# Magic Template

**File:** `Magic.template.json`

**Purpose:** Defines a magical system, tradition, or source of supernatural power within a world.

**Inheritance:** BaseEntity → Magic

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type

**Optional Components:** worldId, source, rules, limitations, cost, spells, practitioners, schools, elements, hierarchy, history

**Relationships:** 1:1 World (composition), M:M Character

**Validation Rules:** prefix must be `mag`, type must be one of defined enum (arcane, divine, nature, etc.), worldId required for non-global systems

**Future Extensions:** Spell-element-school inheritance tree, magic cost and balance simulation
