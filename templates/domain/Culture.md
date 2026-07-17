# Culture Template

**File:** `Culture.template.json`

**Purpose:** Defines a society, people, or cultural group with values, customs, and social structure.

**Inheritance:** BaseEntity → Culture

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseValidation, BaseAI, BaseSearch, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** worldId, type, values, customs, traditions, cuisine, clothing, architecture, art, music, socialStructure, genderRoles, ritesOfPassage, language, religion, taboos

**Relationships:** 1:1 World, M:M Character

**Validation Rules:** prefix must be `cul`, type must be one of defined enum, worldId must reference a valid World entity

**Future Extensions:** Cultural cross-comparison and influence mapping, tradition and rite lifecycle tracking
