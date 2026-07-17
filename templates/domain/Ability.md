# Ability Template

**File:** `Ability.template.json`

**Purpose:** Defines any skill, talent, power, technique, or capability a character can possess.

**Inheritance:** BaseEntity → Ability

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseValidation, BaseAI, BaseSearch, BaseExtension

**Required Components:** identifier, metadata, audit

**Optional Components:** type, category, source, requirements, progression, maxLevel, cooldown, cost, effects, restrictions, learnedBy

**Relationships:** 1:1 Magic (association), M:M Character

**Validation Rules:** prefix must be `abl`, maxLevel must be >= 1 if defined, type must be one of defined enum values

**Future Extensions:** Skill tree progression mapping, level-up requirement and unlock condition tracking
