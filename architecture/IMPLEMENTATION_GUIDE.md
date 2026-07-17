# Implementation Guide

## How to Build from the Frozen Architecture

---

## 1. Architecture Overview for Implementers

```
Project Root: E:\Storynaram\
│
├── config/          ← What: Constants, rules, settings
│                     ← Why: Single source of truth for configuration
│                     ← When to populate: Phase 2
│
├── core/            ← What: Standards, contracts, enums, types
│                     ← Why: Immutable rules that everything conforms to
│                     ← When to implement: Phase 2 (schemas), Phase 3 (validation)
│
├── domain/          ← What: Entity model, aggregates, relationships
│                     ← Why: The "what" — every object in the system
│                     ← When to implement: Phase 2 (templates), Phase 3 (validation)
│
├── ai/              ← What: AI architecture blueprint
│                     ← Why: How AI interacts with story data
│                     ← When to implement: Phase 4+ (prompts), Phase 5 (memory/canon)
│
├── schemas/         ← Future: JSON Schema files
│                     ← When to create: Phase 2
│
├── templates/       ← Future: Reusable entity templates
│                     ← When to create: Phase 2
│
└── scripts/         ← Future: Validation and generation scripts
                      ← When to create: Phase 3
```

---

## 2. Implementation Sequence

### Phase 2: Schema & Template System
1. Fix critical technical debt (TD-001, TD-002)
2. Regenerate clean contract .md files
3. Populate config JSON files
4. Create JSON Schema for all 9 contract types
5. Extend contracts for remaining 29 entity types
6. Create entity templates
7. Fix ID prefix gap (add `npc_`)
8. Update CHANGELOG, ROADMAP

### Phase 3: Validation & Scripting
1. Build JSON Schema validator
2. Implement consistency checker
3. Build relationship integrity validator
4. Create ID generator script
5. Create name generator script
6. Add entity generation scripts
7. Implement import/export utilities
8. Set up logging system

### Phase 4: AI Prompt Library
1. Create prompt templates for each AI agent
2. Implement prompt assembly system
3. Build model-agnostic prompt formatter
4. Create agent-specific prompt variants
5. Test and optimize prompts

### Phase 5: Memory & Canon System
1. Implement knowledge graph loader
2. Build canon registry
3. Implement conflict detection
4. Create canon approval workflow
5. Implement memory storage
6. Build retrieval pipeline

---

## 3. Architectural Guidelines for Implementers

### File Creation Rules
- Always include metadata block (version, status, timestamps)
- Use the standard ID format: `{prefix}_{6+ digit sequence}`
- Reference entities by ID only (not name or path)
- Each entity file is self-contained (no external references in data)
- Relationships are documented in the relationships block

### Directory Rules
- Max 10,000 files per directory before subdividing
- Max 5 levels of nesting
- README.md required in every directory
- UPPER_SNAKE_CASE.md for standards
- PascalCase.md for contracts

### Naming Rules
- Entity ID prefixes are 2-5 lowercase characters
- Entity names use Title Case
- File names use UPPER_SNAKE_CASE or PascalCase depending on type
- Tag names are lowercase_with_underscores

### Validation Rules
- Every entity must conform to its contract
- Every relationship reference must point to an existing entity
- IDs must match the regex pattern for their type
- Lifecycle transitions must be valid per the state machine
- Canon entities cannot be modified without approval

---

## 4. Key Patterns to Follow

### Entity Creation Pattern
```
1. Assign entity ID (prefix + next sequence number)
2. Begin in "draft" lifecycle status
3. Include complete metadata block
4. Set all required fields per contract
5. Document relationships
6. Add descriptive tags
7. Validate against contract
8. Save to appropriate directory
```

### Relationship Pattern
```
1. Entity A has field referencing Entity B's ID
2. Entity B (if bidirectional) has inverse reference
3. Relationship type indicates semantics
4. Cardinality and direction documented in relationship matrix
```

### Validation Pattern
```
1. Check schema conformance (field types, required fields)
2. Check referential integrity (referenced entities exist)
3. Check lifecycle validity (transition is allowed)
4. Check naming compliance (ID format, naming rules)
5. Check canon consistency (no locked entity changes)
6. Check relationship integrity (bidirectional refs match)
```

---

## 5. Critical Files to Read Before Implementing

| File | Why |
|------|-----|
| core/standards/JSON_STANDARD.md | Data format rules |
| core/standards/ID_STANDARD.md | ID schema |
| core/standards/NAMING_STANDARD.md | Naming conventions |
| core/standards/METADATA_STANDARD.md | Metadata requirements |
| domain/entities/ENTITY_CATALOG.md | All 86 entity definitions |
| domain/documentation/AGGREGATES.md | Aggregate boundaries |
| domain/documentation/RELATIONSHIP_MATRIX.md | All relationships |
| domain/documentation/LIFECYCLES.md | State machines |
| architecture/ | All review documents |
