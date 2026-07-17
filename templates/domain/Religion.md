# Religion Template

**File:** `Religion.template.json`

**Purpose:** Defines a faith, belief system, religious institution, or pantheon within a world.

**Inheritance:** BaseEntity → Religion

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseValidation, BaseAI, BaseSearch, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** worldId, type, deities, prophets, holyTexts, beliefs, practices, rituals, holidays, clergy, placesOfWorship, symbols, tenets, taboos, followers, history

**Relationships:** 1:1 World, M:M Character

**Validation Rules:** prefix must be `rel`, type must be one of defined enum (monotheistic, polytheistic, etc.), worldId must reference a valid World entity

**Future Extensions:** Deity hierarchy and pantheon relationship mapping, religious conflict alignment detection
