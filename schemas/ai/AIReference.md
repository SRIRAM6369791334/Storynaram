# AIReference

**File:** `AIReference.schema.json`

**Purpose:** Entity, relationship, memory, canon, and source references with aggregate confidence scoring.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIReference.template.json`

**Required Properties:** none

**Key Enums:** memoryRef type (shortTerm, longTerm, working, archived); sourceRef sourceType (book, chapter, scene, userInput, generated, external)

**Validation Notes:** relationshipRef.strength 0-1; sourceRef.reliability 0-1; overall confidence 0-1.

**Runtime Role:** Provides a unified reference index the AI uses to cite entities, relationships, memories, canon facts, and sources.

**Cross-References:** AIContext, AICanon, AIMemory, AISearch
