# Future Extensions

## Designed Extension Points

---

## 1. Persistence Extensions

| Extension | Prepared By | ADR Reference |
|-----------|------------|--------------|
| PostgreSQL migration | DB_READINESS.md maps entities to tables | ADR-0001 |
| MongoDB document store | Document-oriented entity structure | ADR-0001 |
| Neo4j graph database | Graph model (nodes, edges, traversals) | ADR-0001 |
| Vector database | Embedding store architecture defined | ADR-0001 |
| Hybrid file+DB mode | Graceful migration path documented | ADR-0009 |

---

## 2. AI Extensions

| Extension | Prepared By | ADR Reference |
|-----------|------------|--------------|
| Multi-model orchestration | Model-agnostic pipeline architecture | ADR-0008 |
| Real-time streaming | Pipeline supports streaming output | ADR-0008 |
| Knowledge graph traversal | Graph algorithms predefined | ADR-0005 |
| Ensemble reasoning | Agent architecture supports orchestration | ADR-0005 |
| Custom fine-tuned models | Embedding versioning supports model swap | ADR-0008 |
| RAG (Retrieval-Augmented Generation) | Full retrieval pipeline defined | ADR-0005 |

---

## 3. Integration Extensions

| Extension | Prepared By | ADR Reference |
|-----------|------------|--------------|
| REST API | Bounded contexts define API boundaries | ADR-0002 |
| Import/Export pipeline | Import/Export commands defined | ADR-0006 |
| Plugin architecture | Modular design supports plugins | ADR-0002 |
| Webhooks | Event-driven architecture | ADR-0006 |
| Publishing connectors | Export pipeline connects to platforms | ADR-0006 |

---

## 4. Collaboration Extensions

| Extension | Prepared By | ADR Reference |
|-----------|------------|--------------|
| Multi-user auth | Security metadata model includes permissions | ADR-0007 |
| Concurrent editing | Change tracking, conflict resolution | ADR-0007 |
| Workflow engine | Lifecycle state machines define transitions | ADR-0002 |
| Comment/annotation system | Note and Annotation entity types | ADR-0004 |

---

## 5. Advanced Story Features

| Extension | Prepared By | ADR Reference |
|-----------|------------|--------------|
| Procedural generation | Domain model provides constraints | ADR-0004 |
| Interactive branching | Narrative structure supports branching | ADR-0004 |
| Map integration | Map/Image entities defined | ADR-0004 |
| Audio narration | Media pipeline placeholder | ADR-0004 |
| Translation management | Locale metadata field predefined | ADR-0007 |

---

## 6. Already Accommodated

These features are supported by the current architecture:

- **Multiple books per series** ✅ (Series → Book hierarchy)
- **Multiple POV characters** ✅ (POV field in Scene)
- **Multiple magic systems** ✅ (Magic aggregate root)
- **Custom calendars** ✅ (Calendar entity)
- **Multiple languages** ✅ (Language entity)
- **Multiple races/species** ✅ (Race and Species entities)
- **Family trees** ✅ (Family entity in Character aggregate)
- **Character relationships** ✅ (Relationship entity)
- **Narrative arcs spanning books** ✅ (Arc entity)
- **Non-linear timelines** ✅ (Event-based chronology)
- **Fantasy/sci-fi elements** ✅ (Magic, Technology entities)
