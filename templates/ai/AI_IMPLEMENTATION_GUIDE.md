# AI Template Framework — Implementation Guide

## Step 1: Understand the Template Hierarchy

The AI templates are not inherited from BaseEntity. They are standalone configuration blocks that are composed into entity documents via BaseAI.

```json
{
  "ai": {
    "visibility": "visible",
    "embedding": { ... },
    "retrieval": { ... },
    "context": { ... },
    "memory": { ... },
    "canon": { ... }
  }
}
```

## Step 2: Configure BaseAI on Entity Documents

For each entity type, decide which AI blocks to enable:

| Entity Type | Suggested AI Blocks |
|-------------|-------------------|
| Character | AIContext, AIMemory, AICanon, AIEmbedding, AIPrompt |
| Book | AIContext, AISummary, AIEmbedding |
| Scene | AIContext, AIPrompt, AIValidation |
| World | AIContext, AICanon, AIEmbedding |
| Timeline | AIContext, AIRetrieval, AIReference |

## Step 3: Configure Embeddings

```json
{
  "embedding": {
    "enabled": true,
    "modelName": "text-embedding-3-small",
    "dimensions": 1536,
    "strategy": "document",
    "fields": ["metadata.title", "metadata.summary", "metadata.description"],
    "refreshPolicy": "on-write"
  }
}
```

## Step 4: Configure Retrieval Strategy

```json
{
  "retrieval": {
    "keyword": { "enabled": true, "maxResults": 10 },
    "semantic": { "enabled": true, "minScore": 0.7 },
    "hybrid": { "fullTextWeight": 0.4, "semanticWeight": 0.6 },
    "canon": { "enabled": true, "strictMode": true },
    "memory": { "shortTerm": true, "longTerm": true, "maxMemoryItems": 20 }
  }
}
```

## Step 5: Configure Canon Rules

For entities that must maintain narrative consistency:

```json
{
  "canon": {
    "verificationMode": "strict",
    "canonRules": [
      { "canonId": "canon_000001", "statement": "Rule content", "importance": 95, "category": "fact" }
    ],
    "conflictDetection": { "enabled": true, "threshold": 0.8 }
  }
}
```

## Step 6: Token Budget

```json
{
  "tokenBudget": {
    "maxContextTokens": 64000,
    "priorityLevels": [
      { "level": "critical", "maxTokens": 16000 },
      { "level": "high", "maxTokens": 12000 },
      { "level": "medium", "maxTokens": 8000 },
      { "level": "low", "maxTokens": 4000 }
    ],
    "overflow": "summarize"
  }
}
```

## Step 7: Testing the Pipeline

Test each stage independently:

1. **Context Collection** — verify all context sources are assembled
2. **Memory Retrieval** — verify memory items are correctly ranked
3. **Canon Verification** — verify violations are caught
4. **Prompt Assembly** — verify prompt structure is correct
5. **Reasoning** — verify reasoning steps are logged
6. **Validation** — verify output passes all checks
