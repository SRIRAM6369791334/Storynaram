# Bounded Contexts Directory

## Purpose
Defines the Bounded Contexts of the Storynaram domain model.

## Responsibility
Maps the domain into bounded contexts â€” each context is a self-contained domain boundary with its own ubiquitous language, entities, and logic. Contexts communicate through well-defined interfaces.

## Context Map
`mermaid
graph TB
    subgraph "Narrative Context"
        BC1[Book Management]
    end
    subgraph "Character Context"
        BC2[Character Management]
    end
    subgraph "World Context"
        BC3[World Building]
    end
    subgraph "Timeline Context"
        BC4[Timeline Management]
    end
    subgraph "Organization Context"
        BC5[Organization Management]
    end
    subgraph "Magic Context"
        BC6[Magic System]
    end
    subgraph "Item Context"
        BC7[Item Management]
    end
    subgraph "AI Context"
        BC8[AI Services]
    end
    subgraph "Configuration Context"
        BC9[Configuration]
    end

    BC1 --> BC2
    BC1 --> BC4
    BC2 --> BC3
    BC2 --> BC5
    BC3 --> BC4
    BC6 --> BC2
    BC7 --> BC2
    BC8 --> BC1
    BC8 --> BC2
    BC8 --> BC3
    BC8 --> BC4
    BC9 --> BC1
    BC9 --> BC2
    BC9 --> BC3
`

## Context Definitions
| Context | Ubiquitous Language | Entities |
|---------|-------------------|----------|
| **Narrative** | Book, Chapter, Scene, Plot | Narrative aggregate |
| **Character** | Character, Hero, Villain, NPC | Character aggregate |
| **World** | Location, Geography, Climate | World aggregate |
| **Timeline** | Event, Era, Calendar | Timeline aggregate |
| **Organization** | Guild, Army, House | Organization aggregate |
| **Magic** | Spell, Magic System | Magic aggregate |
| **Item** | Weapon, Artifact | Item aggregate |
| **AI** | Knowledge, Retrieval, Context | AI services |
| **Configuration** | Config, Project Settings | Config aggregate |

## Dependencies
- entities/ â€” entities belonging to each context
- aggregates/ â€” aggregate roots per context
- relationships/ â€” cross-context relationships
