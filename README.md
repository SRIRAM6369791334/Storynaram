# Storynaram — Story Operating System

**Version:** 0.1.0 | **Status:** Foundation Phase | **License:** MIT

Storynaram is a production-grade Story Operating System designed for professional novel creation at scale. It is not a writing tool — it is an **operating system for storytelling** that manages the entire lifecycle of narrative creation, from world-building through publication.

Inspired by the architectural rigor of Git, the modular depth of Unreal Engine, the organizational clarity of Notion, and the extensibility of VS Code, Storynaram treats story creation as an **engineering discipline** while enabling boundless creativity.

---

## Capabilities

- **100+ Books** — Series-scale narrative management
- **10,000+ Characters** — Full relational and psychological modeling
- **Millions of Timeline Events** — Chronological precision at any scale
- **Unlimited Chapters & Scenes** — Atomic narrative unit management
- **AI-Assisted Writing** — Intelligent generation, suggestion, and collaboration
- **AI Knowledge Base** — Structured knowledge retrieval for context-aware assistance
- **AI Canon Management** — Definitive canon tracking with conflict detection
- **AI Consistency Validation** — Automated cross-domain consistency checking

---

## Architecture Overview

```
Storynaram/
├── config/         # Central configuration — identity, rules, versioning
├── world/          # Geography, physics, ecology, cosmology
├── timeline/       # Chronological ledger — eras, events, calendars
├── characters/     # Character management — identity through death
├── locations/      # Specific named places where scenes occur
├── organizations/  # Groups, guilds, governments, societies
├── religions/      # Belief systems and theological structures
├── languages/      # Linguistic systems and constructed languages
├── species/        # Biological taxonomy and creature definitions
├── races/          # Cultural-ethnic groupings
├── magic/          # Magical systems, spells, artifacts
├── technology/     # Inventions, machines, weapons, medicine
├── items/          # Objects, treasures, equipment, currencies
├── lore/           # Mythology, legends, traditions, symbols
├── economy/        # Trade, resources, markets, currency
├── politics/       # Power structures, treaties, factions
├── laws/           # Legal systems, codes, justice
├── cultures/       # Social norms, customs, arts, identity
├── education/      # Knowledge transmission systems
├── books/          # Book-level narrative containers
├── chapters/       # Chapter definitions and structure
├── scenes/         # Atomic narrative units
├── dialogues/      # Character speech and communication
├── plots/          # Narrative threads, mysteries, twists
├── memory/         # Knowledge states, canon, consistency
├── templates/      # Reusable entity templates
├── schemas/        # JSON Schema data contracts
├── prompts/        # AI prompt library
├── references/     # External reference materials
├── research/       # Formal research outputs
├── notes/          # Author notes and ideas
├── reviews/        # Quality assurance and feedback
├── assets/         # Visual and media assets
├── exports/        # Generated output files
├── scripts/        # Automation and tooling
├── logs/           # Operational audit trail
├── archive/        # Historical preservation
└── backups/        # Disaster recovery snapshots
```

---

## Design Principles

- **Clean Architecture** — Separation of concerns with domain-boundary isolation
- **Domain-Driven Design** — Each domain is a self-contained bounded context
- **SOLID Principles** — Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
- **Modular Design** — Every module is independently maintainable and replaceable
- **Scalable by Default** — Architecture scales from a single short story to a 100-book series
- **AI-First** — Every structure is designed for AI consumption, generation, and validation
- **Migration-Ready** — File-based now, database-ready for future scaling

---

## Getting Started

1. **Review the architecture** — Start with `ARCHITECTURE.md`
2. **Read the project guide** — `PROJECT_GUIDE.md` covers workflow and conventions
3. **Explore domain directories** — Each directory has a `README.md` explaining its purpose and conventions
4. **Configure the project** — Edit files in `config/` to define project identity and rules
5. **Start building** — Begin with world-building, characters, or directly with narrative

---

## Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | This file — project overview |
| `ARCHITECTURE.md` | System architecture and design decisions |
| `PROJECT_GUIDE.md` | Workflow, conventions, and best practices |
| `ROADMAP.md` | Development roadmap and future plans |
| `CHANGELOG.md` | Version history and changes |
| `LICENSE` | License information |

---

## License

MIT License — see `LICENSE` for details.
