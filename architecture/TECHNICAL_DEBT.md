# Technical Debt Register

## Identified Debt Items

---

## Outstanding Debt

### Critical (Must Fix Before Phase 2)

| ID | Description | Location | Impact | Effort | Recommendation |
|----|-------------|----------|--------|--------|---------------|
| TD-001 | **Contract file corruption** — Book.md contains Item contract, Character.md contains World contract, Item.md is concatenated script output | core/contracts/ | Data integrity — contracts are unreadable as-is | 1 hour | Regenerate all 9 contract .md files from clean templates |
| TD-002 | **Empty config JSON files** — All 8 config JSONs contain `{}` | config/ | Blocks Phase 2 schema validation | 2 hours | Populate with default values matching standards docs |

### High (Fix Before Phase 3)

| ID | Description | Location | Impact | Effort | Recommendation |
|----|-------------|----------|--------|--------|---------------|
| TD-003 | **Missing contracts for 29 entities** — Only 9 of 86 entities have formal data contracts | core/contracts/ | Incomplete specification — entities lack formal validation rules | 8 hours | Generate contracts for all entity types that have domain model definitions |
| TD-004 | **ID prefix gap** — `npc_` prefix exists in domain but not in contract validation regex | core/contracts/Character.md | NPC entities fail prefix validation | 15 min | Add `npc` to Character contract validation regex |
| TD-005 | **Technology orphan** — Contract exists but no domain aggregate or integration with Item/Magic | core/contracts/ domain/ | Technology entities undefined in domain model | 1 hour | Define Technology aggregate or merge into Item/Magic |

### Medium (Fix Before Phase 5)

| ID | Description | Location | Impact | Effort | Recommendation |
|----|-------------|----------|--------|--------|---------------|
| TD-006 | **Memory dual-context** — Memory entity defined in Character aggregate AND AI system entities | domain/entities/ ENTITY_CATALOG.md | Ambiguous domain boundary | 30 min | Resolve: move Memory exclusively to Character aggregate or create separate Memory bounded context |
| TD-007 | **Missing relationship types** — 6 cross-entity relationships not documented in matrix | domain/documentation/RELATIONSHIP_MATRIX.md | Incomplete specification | 30 min | Add: Technology↔World, Culture↔Religion, Language↔Culture, Note↔Entity, Race↔Species |
| TD-008 | **Missing domain docs** — GLOSSARY.md and DECISIONS.md referenced but don't exist | domain/documentation/ | Documentation gaps | 1 hour | Create GLOSSARY.md and DECISIONS.md per README promise |
| TD-009 | **Status enum drift risk** — Status values defined in core/enums/, contracts/, AND domain/lifecycles/ | Multiple | Potential inconsistency | 30 min | Designate core/enums/ as single source of truth; reference from other locations |

### Low (Fix When Convenient)

| ID | Description | Location | Impact | Effort | Recommendation |
|----|-------------|----------|--------|--------|---------------|
| TD-010 | **Technology/Item overlap** — Technology contract may overlap with Item and Magic | core/contracts/ | Conceptual overlap | 1 hour | Review and clarify boundaries or merge into Item |
| TD-011 | **23 AI modules may be excessive** — Some concerns could be merged (e.g., ranking into retrieval) | ai/ | Maintenance overhead | 2 hours | Consider consolidating: ranking+retrieval, agents+workflows |
| TD-012 | **Cache architecture before implementation** — Cache blueprint exists with no code to cache | ai/CACHE.md | Premature detail | 30 min | Ensure cache doc is clearly marked as "future" |

---

## Debt Summary

| Priority | Count | Est. Effort |
|----------|-------|-------------|
| Critical | 2 | 3 hours |
| High | 3 | 10 hours |
| Medium | 4 | 2.5 hours |
| Low | 3 | 3.5 hours |
| **Total** | **12** | **~19 hours** |

**Technical Debt Ratio:** Low (19 hours to resolve all items in a project with 184 files and ~80 hours invested)

**Verdict:** ✅ Acceptable debt level. Critical items must be resolved before Phase 2.
