# AI Template Framework — Migration Guide

## Migrating from v0 (Pre-AI Framework)

### Step 1: Add BaseAI Block

Add the `ai` block to each entity document:

```json
{
  "ai": {
    "visibility": "visible",
    "embedding": { "enabled": false },
    "retrieval": { "keyword": { "enabled": true, "maxResults": 5 } },
    "canon": { "verificationMode": "lenient" }
  }
}
```

### Step 2: Configure Embeddings

1. Select embedding model
2. Define chunk strategy (document, field, or hybrid)
3. Run initial embedding generation for all existing entities
4. Verify vector dimensions match database configuration

### Step 3: Migrate Memory

If existing memory data exists:

1. Classify each memory into one of the 8 memory types
2. Assign importance scores (0-100)
3. Tag with owner entity ID
4. Set consolidation status based on age and access frequency

### Step 4: Set Canon Rules

For entities with established canon:

1. Extract hard facts as canon rules
2. Assign importance scores
3. Set verification mode per entity type
4. Run initial conflict detection scan

### Step 5: Validate

Validate every entity's AI configuration:

```bash
validate --ai --entity-type character
validate --ai --entity-type book
validate --ai --entity-type world
```

## Template Version Migration

| Version Change | Action |
|----------------|--------|
| New AI template field | Add default to existing documents |
| New retrieval strategy | Regenerate embeddings if needed |
| Canon rule format change | Remap existing canon rules |
| Memory type added | Reclassify existing memories |
| Token budget change | Recalculate allocation |
