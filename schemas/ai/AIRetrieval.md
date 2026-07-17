# AIRetrieval

**File:** `AIRetrieval.schema.json`

**Purpose:** Configuration for how the AI retrieves context and memory when generating responses.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIRetrieval.template.json`

**Required Properties:** none

**Key Enums:** none (boolean toggles and numeric weights)

**Validation Notes:** semantic.minScore and hybrid weights constrained to 0-1; graph.traversalDepth defaults to 2.

**Runtime Role:** Determines retrieval strategy (keyword, semantic, hybrid, graph, timeline, relationship, canon, memory) for context assembly.

**Cross-References:** AIContext, AIMemory, AIEmbedding, AICanon, AISearch
