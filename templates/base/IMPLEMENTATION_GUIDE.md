# Implementation Guide

## Overview

The Base Template Framework provides 26 reusable templates that compose into the universal `BaseEntity`. Every entity type in Storynaram inherits from this framework.

## Step-by-Step Implementation

### Step 1: Understand the Architecture

Read these documents in order:

1. `README.md` — framework overview and template catalog
2. `DIAGRAMS.md` — inheritance, composition, and dependency diagrams
3. `ENTITY.md` — BaseEntity composition model
4. `EXTENSION_GUIDE.md` — how to extend without modifying base templates

### Step 2: Create Entity Templates

For each entity type (character, world, book, scene, etc.):

1. Create `templates/entity/{type}/` directory
2. Create `{Type}Entity.template.json` that extends `BaseEntity`
3. Add entity-specific fields in an `entity` object block
4. Override default values where needed
5. Define validation rules in `BaseValidation`
6. Define relationships in `BaseRelationship`
7. Define AI behavior in `BaseAI`
8. Define search behavior in `BaseSearch`
9. Define indexes in `BaseIndex`
10. Define security in `BaseSecurity`

### Step 3: Schema Generation

From each entity template, generate:

1. **JSON Schema** — for validation (`schemas/{type}.v1.json`)
2. **TypeScript Type** — for frontend (`types/{type}.ts`)
3. **PostgreSQL DDL** — for relational storage (`sql/{type}.sql`)
4. **Neo4j Cypher** — for graph storage (`cypher/{type}.cypher`)
5. **Vector Index Config** — for vector search (`vector/{type}.json`)

### Step 4: Validation

```bash
# Validate entity documents against their schema
validate --schema schemas/character.v1.json --document characters/char_000001.json

# Validate all entities in a project
validate --project . --recursive

# Check cross-reference integrity
validate --cross-references

# Check relationship consistency
validate --relationships
```

### Step 5: AI Integration

Configure AI behavior per entity:

```json
{
  "ai": {
    "visibility": "visible",
    "embedding": { "enabled": true, "fields": ["metadata.title", "metadata.description"] },
    "retrieval": { "contextPriority": 80, "weight": 0.9 },
    "canon": { "importance": 90, "locked": true }
  }
}
```

### Step 6: Search Configuration

```json
{
  "search": {
    "fullText": { "fields": ["metadata.title", "metadata.description"] },
    "semantic": { "enabled": true },
    "boosts": { "metadata.title": 3.0, "metadata.keywords": 2.0 }
  }
}
```

### Step 7: Database Indexes

Generate and apply indexes:

```sql
-- Generated from BaseIndex
CREATE INDEX idx_characters_status ON characters ((document->'status'->>'status'));
CREATE INDEX idx_characters_owner ON characters ((document->'ownership'->>'ownerId'));
```

```cypher
// Generated from BaseIndex
CREATE INDEX character_name FOR (c:Character) ON (c.name);
CREATE CONSTRAINT unique_character_id FOR (c:Character) REQUIRE c.id IS UNIQUE;
```

### Step 8: Permissions and Security

```json
{
  "permissions": {
    "accessControl": {
      "owner": { "read": true, "write": true, "delete": true },
      "group": [{ "group": "editor", "read": true, "write": true }]
    }
  },
  "security": {
    "classification": "confidential",
    "auditLogging": { "enabled": true, "logWrites": true }
  }
}
```

### Step 9: Extension Points

Use `BaseExtension` for:

- Plugin registration
- Custom fields not in the schema
- Custom UI components
- Schema extensions
- Third-party integrations

### Step 10: Testing

```bash
# Test entity generation
test --template templates/base/BaseEntity.template.json --output /tmp/test-entity.json

# Test validation rules
test --validation --entity char_000001.json

# Test round-trip serialization
test --roundtrip --input char_000001.json

# Test migration
test --migration --from v1.0 --to v1.1

# Load test (1M documents)
test --load --count 1000000 --concurrency 100
```

## Performance Targets

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Validate entity document | < 10ms | P99 latency |
| Generate JSON Schema from template | < 100ms | Cold start |
| Serialize/deserialize entity | < 1ms | 1KB entity |
| Migration (per document) | < 5ms | Batch of 1000 |
| Search index (per document) | < 50ms | Full-text + vector |

## Production Checklist

- [ ] All entity types have templates extending BaseEntity
- [ ] All required BaseEntity blocks present on every entity
- [ ] Validation rules defined for all fields
- [ ] AI behavior configured (visibility, embedding, retrieval)
- [ ] Search configuration complete
- [ ] Database indexes generated and applied
- [ ] Security classification and audit logging configured
- [ ] Cross-references validated
- [ ] Relationships consistent (bidirectional check)
- [ ] Migration tested for v1.0 → v1.1
- [ ] Load test passed for expected document volume
- [ ] Plugin system tested with sample plugin
