# Domain Model Architecture

## System Architecture Document

**Version:** 0.1.0 | **Last Updated:** 2026-07-17

---

## 1. Domain Overview

The Storynaram Domain Model defines every entity, relationship, behavior, and rule in the Story Operating System. Built on Domain-Driven Design principles, it is the authoritative blueprint for all data structures and business logic.

```mermaid
graph TB
    subgraph "Narrative Domain"
        B[Book] --> C[Chapter]
        C --> S[Scene]
        S --> D[Dialogue]
        B --> A[Arc]
        B --> P[Part]
    end

    subgraph "Character Domain"
        CH[Character] --> RL[Relationship]
        CH --> IN[Inventory]
        CH --> FM[Family]
        CH --> MM[Memory]
    end

    subgraph "World Domain"
        CN[Continent] --> CY[Country]
        CY --> KG[Kingdom]
        KG --> PV[Province]
        PV --> CT[City]
        CT --> VL[Village]
    end

    subgraph "Timeline Domain"
        TL[Timeline] --> ER[Era]
        TL --> EV[Event]
        TL --> WR[War]
        TL --> PR[Prophecy]
    end

    subgraph "Cross-Domain"
        S --> CH
        EV --> CH
        EV --> CT
        CH --> CY
        RL --> CH
    end
```

---

## 2. Design Principles

| Principle | Application |
|-----------|-------------|
| **Domain-Driven Design** | Bounded contexts, ubiquitous language, aggregates |
| **Entity Identity** | Every entity has a globally unique ID |
| **Aggregate Consistency** | Aggregates are transactional boundaries |
| **Reference by ID** | Cross-aggregate references use IDs only |
| **Event-Driven** | State changes produce domain events |
| **Read/Write Separation** | Commands and queries are separated |
| **Layered Architecture** | Domain is isolated from infrastructure |
| **Persistence Ignorance** | Domain model is independent of storage |

---

## 3. Layer Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        APP[Services, Commands, Queries]
    end

    subgraph "Domain Layer"
        DOM[Aggregates, Entities, Value Objects]
        DOM2[Domain Services, Domain Events]
        DOM3[Repositories, Specifications]
    end

    subgraph "Infrastructure Layer"
        INF[Persistence, File System, Database]
        INF2[AI Services, External APIs]
    end

    APP --> DOM
    APP --> DOM2
    APP --> DOM3
    DOM --> INF
    DOM2 --> INF2
    DOM3 --> INF
```

### 3.1 Application Layer
- **Services**: Orchestrate application workflows
- **Commands**: Encapsulate write operations
- **Queries**: Encapsulate read operations
- **DTOs**: Data transfer objects

### 3.2 Domain Layer
- **Aggregates**: Consistency boundaries
- **Entities**: Objects with identity
- **Value Objects**: Immutable descriptive objects
- **Domain Services**: Stateless domain logic
- **Domain Events**: Significant occurrences
- **Repositories**: Collection-like persistence access

### 3.3 Infrastructure Layer
- **Persistence**: File system, database adapters
- **AI Services**: AI model integration
- **External APIs**: Third-party integrations

---

## 4. Bounded Contexts

```mermaid
graph TB
    subgraph "Narrative"
        BC1[Book Context]
    end
    subgraph "Character"
        BC2[Character Context]
    end
    subgraph "World"
        BC3[World Context]
    end
    subgraph "Timeline"
        BC4[Timeline Context]
    end
    subgraph "Organization"
        BC5[Organization Context]
    end
    subgraph "Magic"
        BC6[Magic Context]
    end
    subgraph "Item"
        BC7[Item Context]
    end
    subgraph "AI"
        BC8[AI Context]
    end
    subgraph "Config"
        BC9[Configuration]
    end

    BC1 -.->|references| BC2
    BC1 -.->|references| BC4
    BC2 -.->|references| BC3
    BC2 -.->|references| BC5
    BC3 -.->|references| BC4
    BC6 -.->|references| BC2
    BC7 -.->|references| BC2
    BC8 -.->|reads| BC1
    BC8 -.->|reads| BC2
    BC8 -.->|reads| BC3
    BC8 -.->|reads| BC4
    BC9 -.->|configures| BC1
    BC9 -.->|configures| BC2
```

---

## 5. Aggregate Design

| Aggregate Root | Entities | Value Objects |
|---------------|----------|---------------|
| **Project** | Project, Series | Metadata, Config |
| **Book** | Book, Part, Arc, Chapter, Scene, Dialogue | Metadata, Outline |
| **Character** | Character, Hero, Villain, NPC | Name, Description, Stats |
| **World** | Continent, Country, City, Location | Coordinates, Geography |
| **Timeline** | Timeline, Era, Event, War | DateRange, Duration |
| **Organization** | Organization, Guild, Army | Hierarchy, Membership |
| **Magic** | Magic, Spell, Skill | Power, Element |
| **Item** | Item, Weapon, Armor | Value, Weight |

---

## 6. Entity Identity

Every entity has a globally unique identifier:

```
{prefix}_{sequence}
```

- **Prefix**: 2-5 character domain prefix (hero_, city_, event_)
- **Sequence**: Zero-padded decimal, minimum 6 digits
- **Example**: `hero_000001`, `city_000042`

### Identity Rules
1. IDs are permanent — never change or reuse
2. IDs are globally unique across all entities
3. IDs are assigned at creation, never modified
4. Cross-entity references always use IDs

---

## 7. Relationship Types

| Type | Symbol | Semantics | Example |
|------|--------|-----------|---------|
| **Composition** | ◆— | Parent owns child; child cannot exist without parent | Book ◆— Chapter |
| **Aggregation** | ◇— | Parent contains child; child can exist independently | Guild ◇— Member |
| **Association** | — | Entities know about each other | Character — Scene |
| **Dependency** | - - > | Entity depends on another | Scene - - > Location |
| **Inheritance** | —▷ | Type specialization | Character —▷ Hero |

---

## 8. Domain Events

Domain events capture significant occurrences:

```
CharacterCreated
CharacterUpdated
CharacterDeleted
BookPublished
ChapterCompleted
SceneWritten
TimelineUpdated
CanonChanged
RelationshipCreated
RelationshipRemoved
MagicUnlocked
LocationChanged
ValidationFailed
ExportComplete
```

---

## 9. Lifecycle

All entities follow a standard lifecycle with type-specific variations:

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review
    Review --> Approved
    Review --> Rejected
    Approved --> Locked
    Approved --> Archived
    Locked --> Archived
    Rejected --> Draft
    Archived --> [*]
```

---

## 10. Database Readiness

The domain model is designed for storage-agnostic deployment:

| Database | Mapping Strategy | Key Strength |
|----------|-----------------|--------------|
| **SQLite** | Flat tables, JSON columns | Portability |
| **PostgreSQL** | Normalized tables, JSONB | Relational queries |
| **Neo4j** | Nodes = entities, edges = relationships | Graph traversal |
| **MongoDB** | Documents = aggregates | Flexible schema |
| **Vector DB** | Entity embeddings | Semantic search |

---

## 11. Scalability Targets

| Dimension | Target |
|-----------|--------|
| Books | 100+ |
| Characters | 100,000+ |
| Relationships | Millions |
| Timeline events | Millions |
| Concurrent users | 100+ |
| AI requests/hour | 10,000+ |
| Storage | Multi-terabyte |
