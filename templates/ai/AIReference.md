# AIReference

**File:** `AIReference.template.json`

**Purpose:** Tracks cross-references across entities, relationships, memories (short/long-term/working/archived), canon-confirmed facts, and source provenance with reliability scoring.

**Inputs:** `entityRefs` (entityId, type, mentionCount), `relationshipRefs` (source, target, type, strength), `memoryRefs` (memoryId, type, accessCount), `canonRefs` (canonId, category), `sourceRefs` (sourceType, location, reliability).

**Outputs:** Aggregate `confidence` score (0–1) reflecting overall reference reliability.

**Dependencies:** AIMemory (memory references), AICanon (canon references), AISearch (entity discovery).

**Relationships:** AIMemory, AICanon, AISearch, AIRanking, AIEmbedding.

**Validation Rules:** `relationshipRefs.strength` must be 0–1; `sourceRefs.sourceType` must be one of: `book`, `chapter`, `scene`, `userInput`, `generated`, `external`; `sourceRefs.reliability` must be 0–1.

**Future Extensions:**
- Add reference graph visualization support.
- Implement automatic reference staleness detection.
