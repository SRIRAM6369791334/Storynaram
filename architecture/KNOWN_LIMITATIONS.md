# Known Limitations

## Architectural Constraints and Trade-offs

---

## 1. Persistence Layer

| Limitation | Impact | Mitigation | Target |
|-----------|--------|------------|--------|
| No concurrent write support | Single-user only for file writes | File-based; Phase 9 adds database | Phase 9 |
| No ACID transactions | Risk of partial writes | JSON format is atmic per file | Phase 9 |
| No query language | All queries are file scans | Index cache in ai/ | Phase 9 |
| No referential integrity enforcement | Orphaned references possible | Validation scripts validate refs | Phase 3 |
| File count per directory limited | Entity scale ceiling at 10K/dir | Subdirectory partitioning | Phase 2 |

---

## 2. AI Platform

| Limitation | Impact | Mitigation | Target |
|-----------|--------|------------|--------|
| No vector database | Semantic search not available | File-based embeddings as fallback | Phase 5 |
| No real-time memory | Session memory limited to context | Context Builder prioritization | Phase 5 |
| No streaming AI output | Blocking AI interactions | Pipeline architecture supports future streaming | Phase 6 |
| Single AI model per request | No ensemble or multi-model reasoning | Agent architecture supports future orchestration | Phase 8 |
| Token limits per model | Context truncation | Context Builder optimization hierarchy | Phase 1.6 |

---

## 3. Domain Model

| Limitation | Impact | Mitigation | Target |
|-----------|--------|------------|--------|
| 86 entities, only 9 contracts | Most entities lack formal data contracts | Contracts can be generated from domain specs | Phase 2 |
| No formal JSON Schema | No machine-validatable schema | Documentation-first approach; JSON Schema in Phase 2 | Phase 2 |
| Single inheritance only | No multiple inheritance for hybrid types | Composition pattern via relationships | N/A |
| No event sourcing | Lost past state transitions | Audit trail in metadata | Phase 9 |
| No CQRS | Read/write model not separated | Queries defined separate from commands | Architectural |

---

## 4. Configuration

| Limitation | Impact | Mitigation | Target |
|-----------|--------|------------|--------|
| All JSON configs empty | No runtime configuration values | Populated during Phase 2 setup | Phase 2 |
| No environment switching | Dev/staging/prod not supported | Single-project architecture | Phase 10 |
| No feature flags | No gradual feature rollout | Feature flag system planned | Phase 10 |

---

## 5. Testing & Validation

| Limitation | Impact | Mitigation | Target |
|-----------|--------|------------|--------|
| No automated validation | Manual consistency checks only | Validation scripts in Phase 3 | Phase 3 |
| No schema conformance testing | No machine verification | JSON Schema + validation engine | Phase 2-3 |
| No contract testing | No contract compliance checks | Contract conformance testing | Phase 3 |

---

## 6. Collaboration

| Limitation | Impact | Mitigation | Target |
|-----------|--------|------------|--------|
| Single project per filesystem | No multi-project isolation workspaces | Separate directories per project | N/A |
| No user authentication | No access control | Single-user architecture | Phase 10 |
| No concurrent editing | Merge conflicts on simultaneous writes | Git-based workflow | Phase 3 |
