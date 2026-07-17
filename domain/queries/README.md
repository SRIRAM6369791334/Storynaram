# Queries Directory

## Purpose
Defines Query objects for the Storynaram query model.

## Responsibility
Query objects encapsulate search and retrieval logic. Queries are read-only operations that return data without side effects.

## Query Catalog
| Query | Return Type | Parameters |
|-------|-------------|------------|
| **FindCharacterById** | Character | characterId |
| **FindCharacterByName** | Character[] | name, matchType |
| **FindCharactersByType** | Character[] | type (hero, villain, etc.) |
| **FindCharactersByLocation** | Character[] | locationId |
| **FindCharactersByOrganization** | Character[] | organizationId |
| **FindBookById** | Book | bookId |
| **FindBooksBySeries** | Book[] | seriesName |
| **FindSceneById** | Scene | sceneId |
| **FindScenesByChapter** | Scene[] | chapterId |
| **FindScenesByCharacter** | Scene[] | characterId |
| **FindEventsByDate** | Event[] | startDate, endDate |
| **FindEventsByLocation** | Event[] | locationId |
| **FindLocationsByType** | Location[] | type, parentId |
| **SearchEntities** | Entity[] | query, filters |
| **FindRelationships** | Relationship[] | entityId, relationshipType |
| **FindTimelineByEra** | Event[] | eraId |

## Dependencies
- entities/ â€” query result types
- repositories/ â€” queries use repositories for data access
- indexes/ â€” queries leverage entity indexes
