# Domain Reference Model

## Reference Types

Every domain schema uses string-typed references to refer to other entities:

| Reference Type | Format | Target Schema |
|----------------|--------|---------------|
| Single entity reference | `"string"` (entity ID) | Any domain schema |
| Array of references | `"array"` of `"string"` | Multiple domain schemas |
| Structured reference | `"object"` with id/type | Composite reference |

## Entity Reference Map

```mermaid
graph TB
    subgraph "Character References"
        Char -->|currentLocation| Location
        Char -->|books| Book
        Char -->|scenes| Scene
        Char -->|abilities| Ability
        Char -->|inventory| Item
        Char -->|timelineEvents| TimelineEvent
    end

    subgraph "Book References"
        Book -->|structure.chapters| Chapter
        Book -->|structure.parts| Part
        Book -->|setting.world| World
    end

    subgraph "Scene References"
        Scene -->|characters| Character
        Scene -->|dialogue| Dialogue
        Scene -->|location| Location
        Scene -->|chapterId| Chapter
        Scene -->|bookId| Book
    end

    subgraph "World References"
        World -->|majorLocations| Location
        World -->|countries| Country
        World -->|cultures| Culture
        World -->|organizations| Organization
        World -->|magicSystem| Magic
        World -->|technology| Technology
    end

    subgraph "Item References"
        Item -->|owner| Character
        Item -->|location| Location
    end

    subgraph "Quest References"
        Quest -->|participants| Character
        Quest -->|relatedQuests| Quest
        Quest -->|giver| Character
    end
```

## Future Enhancement

In a future phase, reference fields will be constrained using JSON Schema:
- Pattern matching for ID format: `"pattern": "^[a-z]+_[0-9]{6,}$"`
- Dynamic $ref to entity type schemas
- Cross-schema reference validation via custom keywords
