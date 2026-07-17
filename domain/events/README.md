# Events Directory

## Purpose
Defines Domain Events for the Storynaram domain model.

## Responsibility
Domain events capture significant occurrences within the domain. Events enable loose coupling between bounded contexts and support event-driven workflows.

## Event Catalog
| Event | Trigger | Consumers | Payload |
|-------|---------|-----------|---------|
| **CharacterCreated** | Character creation | Timeline, AI | characterId, type |
| **CharacterUpdated** | Character modification | Canon, AI | characterId, changes |
| **CharacterDeleted** | Character archiving | All references | characterId |
| **BookPublished** | Book publication | Export, Analytics | bookId, date |
| **ChapterCompleted** | Chapter completion | Book, Timeline | chapterId, wordCount |
| **SceneWritten** | Scene completion | Chapter, AI | sceneId, wordCount |
| **TimelineUpdated** | Timeline event change | Characters, AI | eventId, changes |
| **CanonChanged** | Canon status change | All contexts | entityId, newStatus |
| **RelationshipCreated** | New relationship | Character, Graph | relationshipId, types |
| **RelationshipRemoved** | Relationship removal | Character, Graph | relationshipId |
| **MagicUnlocked** | Magic system change | Characters, AI | magicId |
| **LocationChanged** | Location state change | Characters, Events | locationId, changes |
| **ValidationFailed** | Validation failure | AI, Monitoring | entityId, errors |
| **ExportComplete** | Export finished | User, Analytics | exportId, format |

## Dependencies
- entities/ â€” events reference entities
- services/ â€” services raise events
- commands/ â€” events may trigger commands
