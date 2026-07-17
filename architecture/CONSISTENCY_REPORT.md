# Consistency Audit Report

## Cross-Document Consistency Check

---

## 1. Naming Consistency

| Concept | Location A | Location B | Match | Notes |
|---------|-----------|-----------|-------|-------|
| Entity ID prefix | core/contracts/Character.md | domain/ENTITIES.md | ⚠️ | Contracts: 11 prefixes; Domain: 13 types (missing `npc_`) |
| Status enum | core/enums/ | domain/lifecycles/ | ✅ | Consistent across both |
| Relationship types | core/relationships/ | domain/relationships/ | ✅ | Consistent cardinality |
| Bounded contexts | core/standards/ | domain/bounded_contexts/ | ✅ | 7 contexts match |
| File naming | UPPER_SNAKE_CASE.md standards | PascalCase.md contracts | ✅ | Per convention |

---

## 2. Concept Duplication

| Concept | Found At 1 | Found At 2 | Verdict |
|---------|-----------|-----------|---------|
| Memory entity | domain/entities/ (Character aggregate) | domain/ENTITIES.md (System/AI) | ⚠️ **DUPLICATE CONCEPT** — Memory is in Character aggregate AND System entities |
| Scene Contract | core/contracts/Scene.md | Embedded within core/contracts/Item.md | ❌ **DUPLICATE** — PowerShell generation artifact |
| Character Contract | core/contracts/Character.md | Embedded within core/contracts/World.md | ❌ **DUPLICATE** — PowerShell generation artifact |
| ID Rules | core/standards/ID_STANDARD.md | config/id_rules.json | ✅ Intended (docs vs config) |
| Name conventions | core/standards/NAMING_STANDARD.md | config/naming_rules.json | ✅ Intended (docs vs config) |

---

## 3. Missing Relationships

| Entity A | Entity B | Relationship | Documented In | Status |
|----------|----------|-------------|---------------|--------|
| Technology | Character | uses | domain/RELATIONSHIP_MATRIX.md | ✅ Documented |
| Technology | World | tech_level | domain/RELATIONSHIP_MATRIX.md | ❌ **MISSING** |
| Culture | Religion | has_religion | domain/RELATIONSHIP_MATRIX.md | ❌ **MISSING** |
| Language | Culture | spoken_by | domain/RELATIONSHIP_MATRIX.md | ❌ **MISSING** |
| Note | Entity | references | domain/RELATIONSHIP_MATRIX.md | ❌ **MISSING** |
| Race | Species | belongs_to | domain/RELATIONSHIP_MATRIX.md | ❌ **MISSING** (mentioned in contracts but not in matrix) |

---

## 4. Missing Documentation

| Expected Document | Should Be At | Status |
|------------------|-------------|--------|
| GLOSSARY.md | domain/documentation/ | ❌ Referenced in README but missing |
| DECISIONS.md | domain/documentation/ | ❌ Referenced in README but missing |
| Technology aggregate | domain/aggregates/ | ⚠️ Technology contract exists but no aggregate defined |
| Templates | templates/ | ❌ Empty directory (planned for Phase 2) |
| Schemas | schemas/ | ❌ Empty directory (planned for Phase 2) |

---

## 5. Contract-Entity Coverage Gap

| Entity | Contract Exists | Domain Model Exists | Gap |
|--------|----------------|-------------------|-----|
| Character | ✅ | ✅ | — |
| Book | ✅ | ✅ | — |
| Scene | ✅ | ✅ | — |
| World | ✅ | ✅ | — |
| Timeline | ✅ | ✅ | — |
| Organization | ✅ | ✅ | — |
| Magic | ✅ | ✅ | — |
| Item | ✅ | ✅ | — |
| Technology | ✅ | ✅ (partial) | No aggregate defined |
| Species | ❌ | ✅ | ❌ Missing |
| Race | ❌ | ✅ | ❌ Missing |
| Culture | ❌ | ✅ | ❌ Missing |
| Religion | ❌ | ✅ | ❌ Missing |
| Language | ❌ | ✅ | ❌ Missing |
| Lore | ❌ | ✅ | ❌ Missing |
| Arc | ❌ | ✅ | ❌ Missing |
| Family | ❌ | ✅ | ❌ Missing |
| Relationship | ❌ | ✅ | ❌ Missing |
| Calendar | ❌ | ✅ | ❌ Missing |
| Prophecy | ❌ | ✅ | ❌ Missing |
| War | ❌ | ✅ | ❌ Missing |
| Quest | ❌ | ✅ | ❌ Missing |
| Spell | ❌ | ✅ | ❌ Missing |
| Skill | ❌ | ✅ | ❌ Missing |
| Ability | ❌ | ✅ | ❌ Missing |
| Guild | ❌ | ✅ | ❌ Missing |
| Army | ❌ | ✅ | ❌ Missing |
| Clan | ❌ | ✅ | ❌ Missing |
| Map | ❌ | ✅ | ❌ Missing |

**Total: 29 uncovered entities without contracts**

---

## 6. Consistency Score

| Category | Score | Issues Found |
|----------|-------|-------------|
| Naming Consistency | 9/10 | 1 prefix mismatch |
| Concept Duplication | 7/10 | 3 duplicates found |
| Missing Relationships | 8/10 | 6 missing relationships |
| Missing Documentation | 6/10 | 4 missing documents |
| Contract Coverage | 4/10 | 29 entities without contracts |

**Overall Consistency: 6.8/10**
