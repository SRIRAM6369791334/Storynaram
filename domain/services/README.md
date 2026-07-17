# Services Directory

## Purpose
Defines Domain and Application Services for the Storynaram domain model.

## Responsibility
Services encapsulate domain logic that doesn't naturally fit within an entity or value object. Domain services operate within a bounded context; application services orchestrate across contexts.

## Domain Services
| Service | Context | Responsibility |
|---------|---------|---------------|
| **CharacterIdentityService** | Character | Ensures unique character identities |
| **WorldGeographyService** | World | Validates geographical consistency |
| **TimelineValidationService** | Timeline | Validates chronological integrity |
| **RelationshipService** | Character | Manages character relationship graph |
| **CanonValidationService** | All | Validates canon consistency |
| **NamingService** | All | Ensures naming convention compliance |

## Application Services
| Service | Responsibility |
|---------|---------------|
| **BookCreationService** | Orchestrates full book creation workflow |
| **CharacterCreationService** | Orchestrates character creation with validation |
| **SceneWritingService** | Orchestrates scene writing with AI |
| **ExportService** | Orchestrates manuscript export |
| **ImportService** | Orchestrates data import |
| **ValidationService** | Orchestrates multi-stage validation |

## Dependencies
- entities/ â€” services operate on entities
- aggregates/ â€” services orchestrate aggregate operations
- events/ â€” services raise domain events
- commands/ â€” services execute commands
