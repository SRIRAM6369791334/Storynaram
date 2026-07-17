# Repositories Directory

## Purpose
Defines Repository interfaces for aggregate persistence.

## Responsibility
Repositories provide collection-like access to aggregates. Each aggregate root has a corresponding repository that handles loading, saving, and querying. Repositories abstract the persistence mechanism.

## Repository Interfaces
| Repository | Aggregate Root | Key Methods |
|------------|---------------|-------------|
| **ProjectRepository** | Project | findById, save, delete |
| **BookRepository** | Book | findById, findBySeries, save |
| **CharacterRepository** | Character | findById, findByName, findByType |
| **WorldRepository** | World | findById, findByName, findByType |
| **TimelineRepository** | Timeline | findById, findByDate, findByEra |
| **OrganizationRepository** | Organization | findById, findByName, findByType |
| **MagicRepository** | Magic | findById, findByType, findByElement |
| **ItemRepository** | Item | findById, findByType, findByOwner |
| **EventRepository** | Event | findById, findByDate, findByParticipants |
| **SceneRepository** | Scene | findById, findByChapter, findByCharacter |

## Repository Pattern
`	ext
interface Repository<T> {
    findById(id: Identifier): T
    findAll(spec: Specification<T>): T[]
    save(entity: T): void
    delete(entity: T): void
    count(spec: Specification<T>): number
}
`

## Dependencies
- aggregates/ â€” repositories operate on aggregate roots
- entities/ â€” entity types used by repositories
- queries/ â€” specification and query objects
