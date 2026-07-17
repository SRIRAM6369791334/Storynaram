# Design Decisions Summary

## Key Architectural Decisions and Rationale

---

## Decision 1: File-Based Architecture with Migration Path

**Decision:** Store all data as JSON files on disk, with a documented migration path to database.

**Rationale:**
- Zero infrastructure dependencies for authors
- Version-control friendly (Git-trackable)
- Human-readable and editable
- Simple backup (file copy)
- Progressive complexity: start simple, scale up

**Trade-offs:**
- No concurrent write support
- No built-in query engine
- File count limits (10K per directory threshold)

---

## Decision 2: Clean Architecture with DDD

**Decision:** Organize the system in concentric layers: config → core → domain → ai.

**Rationale:**
- Separation of concerns
- Dependency inversion (core depends on nothing, everything depends on core)
- DDD tactical patterns (aggregates, value objects, repositories)
- Testability

---

## Decision 3: Entity ID Schema: `{prefix}_{sequence}`

**Decision:** All entity IDs follow `{prefix}_{zero_padded_sequence}` format (e.g., `hero_000001`).

**Rationale:**
- Human-readable and recognizable
- Self-documenting (prefix encodes entity type)
- Sortable by creation order
- Consistent across all entity types

**Trade-offs:**
- ID collisions if prefix rules violated
- Sequential IDs leak information about entity count

---

## Decision 4: Mermaid-First Documentation

**Decision:** Use Mermaid markdown for all diagrams.

**Rationale:**
- Version-controllable (text-based)
- Renderable on GitHub and VS Code
- No external tool dependencies
- Updates are diffs, not binary changes

---

## Decision 5: AI Architecture as Blueprint, Not Implementation

**Decision:** AI directory defines architecture, not code. Implementation happens later.

**Rationale:**
- Architecture must precede implementation
- Model-agnostic design (OpenAI, Claude, Gemini, local)
- Knowledge graph and retrieval patterns can be designed independent of technology
- Avoid premature commitment to specific AI frameworks

---

## Decision 6: Domain Model as Specification, Not Persistence

**Decision:** Domain model documents what, not how. Persistence is an infrastructure concern.

**Rationale:**
- Domain model should be technology-agnostic
- Supports multiple database strategies (file, SQL, graph)
- Business logic in domain, storage in infrastructure

---

## Decision 7: Canon Immutability

**Decision:** Once locked, canon cannot be modified without formal RFC and approval workflow.

**Rationale:**
- Story integrity requires immutable truth
- Prevents accidental retcons
- Full audit trail for all canon changes
- Human-in-the-loop for canon changes

---

## Decision 8: Model-Agnostic AI Pipeline

**Decision:** AI pipeline is model-agnostic with modular prompt assembly.

**Rationale:**
- Future-proof against model changes
- Support multiple providers simultaneously
- A/B test different models
- Fallback strategy (large → small model)
