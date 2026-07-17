# Storynaram Architecture

## System Architecture Document

**Version:** 0.1.0 | **Last Updated:** 2026-07-17

---

## 1. Architectural Philosophy

Storynaram is built on the foundation of **Clean Architecture** as defined by Robert C. Martin, adapted for the domain of narrative creation. The system separates concerns into concentric layers, with dependencies pointing inward toward core domain logic.

### Core Tenets

- **Domain Independence** — Each domain (characters, world, timeline, etc.) is a self-contained bounded context that can evolve independently
- **Persistence Ignorance** — The current file-based storage is an implementation detail; the architecture supports future migration to databases without domain changes
- **AI Integration Ready** — Every data structure is designed for both human and AI consumption, with explicit semantics and structured relationships
- **Scale-Up Architecture** — Patterns that work for a single short story also scale to 100+ books with millions of entities

---

## 2. Layer Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Presentation Layer                    │
│              (Exports, Scripts, Prompts, AI Tools)        │
├──────────────────────────────────────────────────────────┤
│                      Application Layer                    │
│           (Books, Chapters, Scenes, Dialogues, Plots)     │
├──────────────────────────────────────────────────────────┤
│                        Domain Layer                       │
│  (Characters, World, Timeline, Magic, Items, Lore, etc.) │
├──────────────────────────────────────────────────────────┤
│                     Foundation Layer                      │
│       (Config, Schemas, Templates, Memory, Logs)         │
├──────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                   │
│        (Scripts, Exports, Backups, Archive, Assets)      │
└──────────────────────────────────────────────────────────┘
```

### 2.1 Foundation Layer
The bedrock of the system. Defines how everything is structured, validated, and tracked.

| Module | Responsibility |
|--------|---------------|
| `config/` | System identity, rules, versioning, settings |
| `schemas/` | JSON Schema data contracts for every entity type |
| `templates/` | Reusable entity blueprints |
| `memory/` | State tracking, knowledge bases, consistency validation |
| `logs/` | Operational audit trail |

### 2.2 Domain Layer
The core business logic of the story operating system. Each domain is a bounded context.

| Module | Responsibility |
|--------|---------------|
| `world/` | Geographical, physical, ecological reality |
| `timeline/` | Chronological ordering and temporal systems |
| `characters/` | Character identity, psychology, relationships |
| `locations/` | Specific named places |
| `organizations/` | Group structures and hierarchies |
| `religions/` | Belief systems and theology |
| `languages/` | Linguistic systems |
| `species/` | Biological taxonomy |
| `races/` | Cultural-ethnic groupings |
| `magic/` | Magical systems and phenomena |
| `technology/` | Inventions and technical systems |
| `items/` | Physical objects and possessions |
| `lore/` | Cultural knowledge and traditions |
| `economy/` | Economic systems |
| `politics/` | Power structures |
| `laws/` | Legal systems |
| `cultures/` | Social norms and identity |
| `education/` | Knowledge transmission |

### 2.3 Application Layer
The narrative construction layer. Composes domain entities into story structure.

| Module | Responsibility |
|--------|---------------|
| `books/` | Top-level narrative containers |
| `chapters/` | Chapter-level structure |
| `scenes/` | Atomic narrative units |
| `dialogues/` | Character speech management |
| `plots/` | Narrative thread orchestration |
| `notes/` | Author thoughts and ideas |
| `reviews/` | Quality assessment |
| `references/` | External source materials |
| `research/` | Formal research outputs |

### 2.4 Presentation Layer
The output and interaction layer. Generates deliverables and provides interfaces.

| Module | Responsibility |
|--------|---------------|
| `exports/` | Generated output files in publishable formats |
| `scripts/` | Automation and tooling |
| `prompts/` | AI interaction templates |
| `assets/` | Media and visual resources |

### 2.5 Infrastructure Layer
Operational support. Keeps the system running and safe.

| Module | Responsibility |
|--------|---------------|
| `backups/` | Disaster recovery snapshots |
| `archive/` | Historical preservation |
| `logs/` | Operational recording |

---

## 3. Data Flow Architecture

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Config  │───▶│ Schemas  │───▶│Templates │───▶│  Entity  │
│  Rules   │    │Contracts │    │Defaults  │    │ Instance │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                       │
                                                       ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Memory  │◀───│ Validate │◀───│   All    │◀───│  Domain  │
│  Canon   │    │Consistency│   │  Entity  │    │  Data    │
└──────────┘    └──────────┘    │   Types  │    └──────────┘
                                └──────────┘
                                       │
                                       ▼
                                ┌──────────┐    ┌──────────┐
                                │  Books / │───▶│  Export  │
                                │ Chapters │    │ Pipeline │
                                │  Scenes  │    └──────────┘
                                │  Plots   │
                                └──────────┘
```

---

## 4. Entity Relationship Model

Every entity in the system follows a consistent pattern:

```json
{
  "id": "ent_abc123",
  "type": "character",
  "name": "Entity Name",
  "metadata": {
    "created": "2026-07-17T00:00:00Z",
    "modified": "2026-07-17T00:00:00Z",
    "version": 1,
    "status": "draft"
  },
  "data": { ... },
  "relationships": {
    "parent": "ref_xyz789",
    "children": ["ref_abc456", "ref_def789"],
    "related": ["ref_ghi012"]
  },
  "tags": ["protagonist", "human", "mage"]
}
```

### Relationship Types
- **Parent/Child** — Hierarchical relationships (book → chapter → scene)
- **Association** — Bidirectional references (character ↔ organization)
- **Temporal** — Timeline-anchored relationships (event at location)
- **Dependency** — Entity A depends on Entity B (spell depends on magic system)
- **Provenance** — Source tracking (reference → entity)

---

## 5. ID System

IDs follow the schema defined in `config/id_rules.json`:

- **Format**: `{prefix}_{uuid_short}` (e.g., `char_a1b2c3d4`)
- **Prefixes** are domain-specific: `char_`, `world_`, `loc_`, `item_`, etc.
- **Uniqueness** is guaranteed across the entire project
- **References** use full IDs for cross-domain linking

---

## 6. Validation Architecture

```
                    ┌─────────────────────┐
                    │  Schema Validation   │
                    │  (Structure Check)   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Rule Validation     │
                    │  (Business Logic)    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Cross-Domain       │
                    │  Consistency Check  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Canon Conflict     │
                    │  Detection          │
                    └─────────────────────┘
```

---

## 7. Future Migration Path

The architecture is designed for seamless migration from file-based to database storage:

| Phase | Storage | Query Capability |
|-------|---------|-----------------|
| 1 (Current) | JSON files on filesystem | File reads, grep, scripts |
| 2 | Git-based versioning | Git history, diff, blame |
| 3 | Embedded database (SQLite) | SQL queries, indexing |
| 4 | Client-server database (PostgreSQL) | Full ACID, concurrent access |
| 5 | Distributed storage | Sharding, replication, global access |

Each migration phase preserves the domain structure and entity schemas — only the persistence mechanism changes.

---

## 8. AI Integration Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Prompt    │────▶│   AI Model  │────▶│  Response   │
│  Templates  │     │   (API)     │     │  Processor  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │                                       ▼
       │                                ┌─────────────┐
       │                                │  Memory     │
       │                                │  Updater    │
       │                                └─────────────┘
       │                                       │
       ▼                                       ▼
┌─────────────┐                       ┌─────────────┐
│  Config     │                       │  Canon      │
│  AI Rules   │                       │  Manager    │
└─────────────┘                       └─────────────┘
```

- **Prompts** are structured templates stored in `prompts/`
- **AI Rules** from `config/ai_rules.json` constrain model behavior
- **Memory** provides context and maintains state across interactions
- **Canon Manager** ensures AI output aligns with established canon
- **Validator** checks AI output against schemas and consistency rules

---

## 9. Security Model

- **No secrets** stored in the repository
- **AI API keys** managed via environment variables or external secret stores
- **File permissions** handled by the operating system
- **Future**: Role-based access control for collaborative writing
- **Future**: Audit logging for all data modifications

---

## 10. Performance Considerations

- **File-based storage** supports up to ~100K entities per directory on NTFS
- **Beyond 100K**: Use subdirectory partitioning or migrate to database
- **Large JSON files** (>10MB) should be split into smaller logical units
- **Timeline** with millions of events should use indexed subdirectories by time period
- **AI operations** should batch process to minimize API calls

---

## 11. Design Decisions

| Decision | Rationale |
|----------|-----------|
| **JSON over YAML/TOML** | Universal parser support, schema validation ecosystem, AI-native format |
| **Flat files over database (Phase 1)** | Zero dependencies, human-readable, git-friendly, simple backup |
| **Domain directories over monolithic store** | Clear boundaries, parallel work, independent evolution |
| **README per directory** | Self-documenting, discoverable, AI-friendly context |
| **IDs over names** | Rename-safe references, consistent linking, future migration |
| **File-per-entity** | Simple git diff, parallel writing, no merge conflicts on independent entities |

---

*This architecture document evolves with the project. Major changes are recorded in CHANGELOG.md.*
