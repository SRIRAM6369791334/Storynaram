# Family Template

**File:** `Family.template.json`

**Purpose:** Defines a family tree, lineage, house, or bloodline with ancestry and alliances.

**Inheritance:** BaseEntity → Family

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** worldId, type, head, members, ancestors, familyTree, motto, sigil, colors, titles, holdings, alliances, rivalries, history

**Relationships:** 1:1 World (composition), M:M Character

**Validation Rules:** prefix must be `fam`, worldId must reference a valid World entity, familyTree should point to a valid tree representation

**Future Extensions:** Interactive family tree visualization, genetic trait inheritance tracking
