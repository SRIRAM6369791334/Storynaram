# Language Template

**File:** `Language.template.json`

**Purpose:** Defines a constructed or natural language with script, grammar, and vocabulary.

**Inheritance:** BaseEntity → Language

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** worldId, type, script, alphabet, phonology, grammar, vocabulary, dialects, speakers, origin, relatedLanguages, commonPhrases

**Relationships:** 1:1 World, M:M Character

**Validation Rules:** prefix must be `lng`, type must be one of defined enum, worldId must reference a valid World entity

**Future Extensions:** Phrasebook generation from vocabulary, dialect comparison and etymology tracking
