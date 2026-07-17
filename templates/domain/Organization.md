# Organization Template

**File:** `Organization.template.json`

**Purpose:** Defines any group, guild, order, faction, or collective with hierarchy and purpose.

**Inheritance:** BaseEntity → Organization

**Base Templates Used:** BaseIdentifier, BaseMetadata, BaseAudit, BaseVersion, BaseStatus, BaseLifecycle, BaseOwnership, BaseReference, BaseRelationship, BaseTag, BaseVisibility, BaseLocalization, BaseAttachment, BaseValidation, BaseAI, BaseSearch, BaseHistory, BaseExtension

**Required Components:** identifier, metadata, audit, type

**Optional Components:** worldId, headquarters, leader, hierarchy, members, membershipCount, founded, fell, purpose, beliefs, goals, allies, enemies, ranks, locations

**Relationships:** 1:1 World (composition), M:M Character, M:M Location, M:M Quest

**Validation Rules:** prefix must be `org`, type must be one of defined enum, worldId must reference a valid World entity

**Future Extensions:** Member rank progression tracking, faction influence and reputation scoring
