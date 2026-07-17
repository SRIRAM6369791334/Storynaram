# Architecture Decisions Reference

## Purpose
This document cross-references domain-level design decisions with the formal Architecture Decision Records (ADRs) in architecture/decisions/.

## Decision Mapping

| Domain Decision | ADR | Status |
|-----------------|-----|--------|
| DDD tactical pattern adoption | ADR-0002: Domain Model Separation | ✅ |
| Entity ID schema (prefix_sequence) | ADR-0003: Entity ID Schema | ✅ |
| Entity lifecycle state machines | ADR-0004: Entity Ownership and Lifecycle | ✅ |
| 7 bounded contexts | ADR-0002: Domain Model Separation | ✅ |
| 7 aggregate roots | ADR-0002: Domain Model Separation | ✅ |
| 20+ value object types | ADR-0002: Domain Model Separation | ✅ |
| 47 entity relationships | ADR-0002: Domain Model Separation | ✅ |
| Event-Command-Query separation | ADR-0006: Event-Command-Query Separation | ✅ |
| File-based storage with DB migration path | ADR-0001: Folder Structure and Organization | ✅ |
| Mermaid diagram documentation | ADR-0008: Documentation-First Approach | ✅ |

## Entity Contract Coverage

| Contract Group | ADR Reference | Status |
|----------------|---------------|--------|
| Narrative (Book, Scene, etc.) | ADR-0002 | ✅ |
| Character | ADR-0002 | ✅ |
| World | ADR-0002 | ✅ |
| Timeline | ADR-0002 | ✅ |
| Organization | ADR-0002 | ✅ |
| Magic | ADR-0002 | ✅ |
| Item | ADR-0002 | ✅ |
| Technology | ADR-0005 | ✅ |
| Cultural (Species, Race, Culture, Religion, Language, Lore) | ADR-0002 | ✅ |
| System (Note, Memory, Rule, Canon, etc.) | ADR-0002 | ✅ |
| Timeline subtypes (Calendar, War, Battle, Prophecy, Quest) | ADR-0002 | ✅ |
| Narrative subtypes (Series, Arc, Part, Dialogue) | ADR-0002 | ✅ |

## ID Prefix Reference

All prefixes are defined in config/id_rules.json per ADR-0003.

## Relationship Reference

All relationships are documented in domain/documentation/RELATIONSHIP_MATRIX.md.

## Lifecycle Reference

All lifecycle state machines are documented in domain/documentation/LIFECYCLES.md.

## Next Steps

For Phase 2, all contracts will be implemented as JSON Schema files in schemas/.
