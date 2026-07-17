# AI Standard

## Purpose
Defines the complete set of rules, constraints, and best practices for all AI interactions with the Storynaram system.

---

## 1. AI Read Rules

### 1.1 Context Acquisition
- Read the directory README.md before accessing files in that directory
- Read the relevant contract in core/contracts/ before generating entity data
- Read the relevant standard in core/standards/ before operations
- Read config/ai_rules.json for behavioral constraints
- Read config/writing_rules.json for writing constraints

### 1.2 Context Limits
- Maximum context load: 50 entity files per operation
- Maximum reference depth: 3 levels of indirection
- When context is insufficient, request clarification

---

## 2. AI Write Rules

### 2.1 Creation Rules
1. Never overwrite existing data without explicit instruction
2. Use templates from templates/ as starting points
3. Validate against schemas before writing
4. Generate valid IDs following ID_STANDARD
5. Populate metadata — version, status, timestamps
6. Establish relationships via references
7. Apply tags following TAG_STANDARD

### 2.2 Modification Rules
1. Read before write — never modify without reading current state
2. Use targeted changes — don't rewrite entire files
3. Increment version on every modification
4. Update `updatedAt` timestamp
5. Never modify `metadata.id` or `metadata.createdAt`

### 2.3 Deletion Rules
1. Never delete files — move to archive/ instead
2. Update relationships in related entities
3. Log the deletion in logs/
4. Mark status as `archived` before moving

---

## 3. AI Suggest Rules

### 3.1 Suggestion Format
- **What** is being suggested
- **Why** it is being suggested
- **Where** it should be placed
- **Alternatives** considered
- **Impact** on related entities

### 3.2 Restrictions
- Never suggest content violating writing_rules.json or ai_rules.json
- Never suggest plagiarized content
- Flag suggestions that contradict existing canon

---

## 4. AI Memory Rules

### 4.1 Memory Storage
- AI context in `memory/ai/`
- Character knowledge in `memory/character/`
- World state in `memory/world/`
- Timeline state in `memory/timeline/`

### 4.2 Memory Management
- Update memory after every significant operation
- Check memory before making decisions
- Flag memory conflicts when detected
- Purge irrelevant memory to manage context

---

## 5. AI Context Rules

### 5.1 Context Priority
1. Current task instructions
2. Relevant config rules
3. Relevant contracts
4. Relevant existing entities
5. Related entities (via relationships)
6. Memory of past decisions
7. General project standards

### 5.2 Context Refresh
- Reload config rules every session
- Reload entity data before modification
- Reload memory on session start

---

## 6. AI Validation Rules

### 6.1 Self-Validation
1. JSON format validity
2. Schema conformance
3. ID format correctness
4. Reference integrity
5. Metadata completeness
6. Tag validity
7. Naming conventions

### 6.2 Consistency Validation
1. Cross-reference characters across entities
2. Verify timeline consistency
3. Check name consistency
4. Verify relationship integrity
5. Flag contradictions with canon

---

## 7. AI Canon Rules

### 7.1 Canon Definition
- Canon = finalized, published, approved entity states
- Draft entities are not canon
- Reviewed entities are candidate canon
- Final entities are definitive canon

### 7.2 Canon Conflict Resolution
1. Identify conflicting entities
2. Determine higher canon status
3. Equal status: flag as conflict requiring human decision
4. Unequal status: defer to higher status
5. Document in memory/canon/

---

## 8. AI Safety Rules

### 8.1 Content Safety
- No illegal content generation
- No hate speech or discriminatory content
- Flag mature content with content tags

### 8.2 Data Safety
- Never expose API keys, tokens, or credentials
- Never generate PII
- Never commit secrets to repository

### 8.3 Operational Safety
- Ask before destructive changes
- Ask before modifying config/ or core/ files
- Confirm before batch operations affecting 10+ files

### 8.4 Ethical Guidelines
- Acknowledge AI limitations honestly
- Flag uncertainty rather than fabricating confidence
- Credit human authors for creative work

---

## 9. AI Logging
Every AI operation must be logged with timestamp, operation type, entity IDs, and validation status.
