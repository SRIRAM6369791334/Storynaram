# Commands Directory

## Purpose
Defines Commands for the Storynaram CQRS-inspired command model.

## Responsibility
Commands represent intentions to change state. Each command targets a specific aggregate and triggers domain logic that may produce events.

## Command Catalog
| Command | Target Aggregate | Handler |
|---------|-----------------|---------|
| **CreateCharacter** | Character | CharacterService |
| **UpdateCharacter** | Character | CharacterService |
| **DeleteCharacter** | Character | CharacterService |
| **CreateBook** | Book | BookService |
| **UpdateBook** | Book | BookService |
| **PublishBook** | Book | BookService |
| **CreateChapter** | Book | BookService |
| **CreateScene** | Book | BookService |
| **WriteScene** | Scene | SceneService |
| **CreateTimelineEvent** | Timeline | TimelineService |
| **AssignRelationship** | Character | RelationshipService |
| **RemoveRelationship** | Character | RelationshipService |
| **LockCanon** | Entity | CanonService |
| **ValidateEntity** | Entity | ValidationService |
| **CreateLocation** | World | WorldService |
| **CreateOrganization** | Organization | OrganizationService |
| **CreateMagicEntity** | Magic | MagicService |
| **CreateItem** | Item | ItemService |

## Command Pattern
`	ext
class Command {
    commandId: Identifier
    timestamp: DateTime
    userId: Identifier
    data: CommandData
}
`

## Dependencies
- services/ â€” handlers that execute commands
- aggregates/ â€” commands target aggregates
- events/ â€” commands may produce events
- entities/ â€” command data references entities
