# AI Standard

## Purpose
Defines the complete set of rules, constraints, and best practices for all AI interactions with the Storynaram system. These rules apply to every AI agent, assistant, or model operating on the project.

---

## 1. AI Read Rules

### 1.1 Context Acquisition
- Read the directory README.md before accessing any files in that directory
- Read the relevant contract in core/contracts/ before generating entity data
- Read the relevant standard in core/standards/ before performing operations
- Read config/ai_rules.json for behavioral constraints before any AI action
- Read config/writing_rules.json for writing constraints before generating content

### 1.2 File Reading Protocol
`	ext
1. Identify the domain directory
2. Read the README.md for purpose and conventions
3. Read the relevant contract for data structure
4. Read existing entity files for context
5. Check memory/ for existing knowledge about the domain
6. Read referenced entities for relationship context
`

### 1.3 Context Limits
- Maximum context load: 50 entity files per operation
- Maximum reference depth: 3 levels of indirection
- When context is insufficient, request clarification â€” never invent context

---

## 2. AI Write Rules

### 2.1 Creation Rules
1. **Never overwrite** existing data without explicit human instruction
2. **Use templates** from templates/ as the starting point for new entities
3. **Validate against schemas** before writing
4. **Generate valid IDs** following ID_STANDARD â€” never use placeholder IDs
5. **Populate metadata** â€” version, status, timestamps
6. **Establish relationships** â€” link to existing entities via references
7. **Apply tags** following TAG_STANDARD

### 2.2 Modification Rules
1. **Read before write** â€” never modify without reading the current state
2. **Use edit tool** for targeted changes â€” don't rewrite entire files
3. **Increment version** on every modification
4. **Update updatedAt** timestamp
5. **Update updatedBy** to indicate AI involvement
6. **Document change** in version history when applicable
7. **Never modify** metadata.id or metadata.createdAt

### 2.3 Deletion Rules
1. **Never delete** files â€” move to archive/ instead
2. **Update relationships** â€” remove references from related entities
3. **Log the deletion** in logs/
4. **Mark status** as rchived before moving to archive/

---

## 3. AI Suggest Rules

### 3.1 Suggestion Format
When suggesting content, AI must clearly indicate:
- **What** is being suggested
- **Why** it is being suggested
- **Where** it should be placed
- **Alternatives** considered
- **Impact** on related entities

### 3.2 Suggestion Categories
| Category | Description |
|----------|-------------|
| 
ew | Suggestion to create new entity |
| modify | Suggestion to modify existing entity |
| merge | Suggestion to merge entities |
| split | Suggestion to split entity |
| rchive | Suggestion to archive entity |
| elationship | Suggestion to add/modify relationship |

### 3.3 Suggestion Restrictions
- Never suggest content that violates writing_rules.json
- Never suggest content that violates ai_rules.json
- Never suggest plagiarized or non-original content
- Flag suggestions that contradict existing canon
- Provide rationale for every suggestion

---

## 4. AI Memory Rules

### 4.1 Memory Storage
- AI context and state is stored in memory/ai/
- Character knowledge is stored in memory/character/
- World state is stored in memory/world/
- Timeline state is stored in memory/timeline/

### 4.2 Memory Management
- Update memory after every significant operation
- Check memory before making decisions
- Flag memory conflicts when detected
- Purge irrelevant memory to manage context windows
- Summarize long conversation threads to save context

### 4.3 Memory Structure
`json
{
  "id": "memory_ai_context_000001",
  "type": "ai_memory",
  "timestamp": "2026-07-17T12:00:00Z",
  "context": {
    "currentOperation": "character_creation",
    "entitiesInScope": ["hero_000001", "hero_000002"],
    "recentDecisions": [],
    "pendingActions": []
  }
}
`

---

## 5. AI Context Rules

### 5.1 Context Window Management
- Prioritize relevant context over comprehensive context
- Summarize when full context exceeds 70% of context window
- Use memory/ for persistent context storage
- Refresh stale context (>30 minutes) before acting

### 5.2 Context Priority
`	ext
Priority 1: Current task instructions
Priority 2: Relevant config rules (ai_rules, writing_rules)
Priority 3: Relevant contracts (entity type)
Priority 4: Relevant existing entities
Priority 5: Related entities (via relationships)
Priority 6: Memory of past decisions
Priority 7: General project standards
`

### 5.3 Context Refresh
- Reload config rules every session
- Reload entity data before modification
- Reload memory on session start
- Verify context accuracy before critical operations

---

## 6. AI Validation Rules

### 6.1 Self-Validation
Before presenting output, AI must validate:
1. JSON format validity (valid JSON)
2. Schema conformance (fields match schema)
3. ID format correctness (matches ID_STANDARD)
4. Reference integrity (referenced IDs exist)
5. Metadata completeness (required fields present)
6. Tag validity (tags match TAG_STANDARD)
7. Naming conventions (matches NAMING_STANDARD)

### 6.2 Consistency Validation
1. Cross-reference characters mentioned across entities
2. Verify timeline consistency (no temporal paradoxes)
3. Check name consistency across all references
4. Verify relationship bidirectional integrity
5. Flag contradictions with existing canon

### 6.3 Quality Validation
1. Prose quality (if generating narrative content)
2. Dialogue authenticity (character voice consistency)
3. World logic (magic systems, physics, technology consistency)
4. Plot coherence (cause and effect chain integrity)
5. Character consistency (personality, knowledge, ability continuity)

---

## 7. AI Canon Rules

### 7.1 Canon Definition
- Canon = the set of finalized, published, and approved entity states
- Draft entities are not canon
- Reviewed entities are candidate canon
- Final entities are definitive canon

### 7.2 Canon Interaction
1. Never contradict established canon
2. Flag suggestions that may contradict canon
3. When canon is ambiguous, ask for clarification
4. When canon changes, update all affected entities
5. Canon changes must be documented in memory/decisions/

### 7.3 Canon Conflict Resolution
`	ext
1. Identify the conflicting entities
2. Determine which entity has higher canon status
3. If equal status: flag as conflict requiring human decision
4. If unequal status: defer to higher status entity
5. Document conflict and resolution in memory/canon/
`

---

## 8. AI Safety Rules

### 8.1 Content Safety
- No generation of illegal content
- No generation of hate speech or discriminatory content
- Flag mature content appropriately with content tags
- Respect content rating of the project (configurable in settings.json)

### 8.2 Data Safety
- Never expose or log API keys, tokens, or credentials
- Never generate real personally identifiable information (PII)
- Never commit secrets to the repository
- Use environment variables for sensitive configuration

### 8.3 Operational Safety
- Ask before making destructive changes
- Ask before modifying config/ files
- Ask before modifying core/ files
- Ask before removing entities (vs. archiving)
- Confirm before batch operations affecting 10+ files

### 8.4 Ethical Guidelines
- Acknowledge AI limitations honestly
- Flag uncertainty rather than fabricating confidence
- Credit human authors for their creative work
- Do not claim AI-generated work as human-original
- Support author's creative vision, do not override it

---

## 9. AI Logging Rules

Every AI operation must be logged:
`json
{
  "timestamp": "2026-07-17T12:00:00Z",
  "operation": "entity_create",
  "entityType": "character",
  "entityId": "hero_000001",
  "inputs": ["existing characters", "world context"],
  "outputs": ["hero_000001.json"],
  "validationPassed": true,
  "humanReviewRequired": false
}
`
"@ | Set-Content -Path (Join-Path E:\Storynaram\core\standards "AI_STANDARD.md") -Encoding UTF8

# ============================================================
# DOCUMENTATION_STANDARD.md
# ============================================================
@"
# Documentation Standard

## Purpose
Defines the standards for all documentation in Storynaram. Every .md file must conform to these rules unless explicitly exempted.

## Document Types

### Type 1: Standards
- Location: core/standards/
- Naming: UPPER_SNAKE_CASE.md
- Purpose: Define immutable rules
- Status: Always final once approved
- Exemption: Requires PROJECT_RULES amendment to change

### Type 2: Contracts
- Location: core/contracts/
- Naming: PascalCase.md
- Purpose: Define data shapes for entity types
- Status: Versioned, may evolve

### Type 3: README
- Location: Every directory root
- Naming: README.md
- Purpose: Explain directory purpose and conventions
- Status: Living document

### Type 4: Guides
- Location: Project root or specific directories
- Naming: UPPER_SNAKE_CASE.md
- Purpose: Explain workflows and processes
- Status: Living document

### Type 5: Reference
- Location: eferences/
- Naming: {reference_id}.md
- Purpose: Store external reference information
- Status: Static

### Type 6: Notes
- Location: 
otes/
- Naming: {note_id}.md
- Purpose: Author thoughts and ideas
- Status: Informal

## Required Sections by Document Type

### Standards Documents
- **Purpose** â€” what this standard defines
- **Scope** â€” what entities/processes it applies to
- **Rules** â€” numbered, actionable rules
- **Examples** â€” concrete examples of correct and incorrect usage
- **Enforcement** â€” how compliance is verified
- **See Also** â€” related standards

### Contracts
- **Purpose** â€” what entity type this contract defines
- **Fields** â€” table of all fields, types, required/optional, descriptions
- **Validation Rules** â€” specific validation constraints
- **Relationships** â€” how this entity relates to others
- **Lifecycle** â€” entity lifecycle states
- **Examples** â€” example entity JSON

### README
- **Purpose** â€” directory purpose
- **Responsibility** â€” what the directory is responsible for
- **Naming Convention** â€” how files within are named
- **Contents** â€” what files/directories belong here
- **Future Expansion** â€” planned additions
- **Relationships** â€” related directories

## Writing Style
- **Professional tone** â€” clear, precise, authoritative
- **Active voice** â€” "The validator checks..." not "The check is performed by..."
- **Second person** for instructions: "You must validate before writing"
- **Imperative** for rules: "Use camelCase for field names"
- **No marketing language** â€” this is technical documentation
- **No humor or casual language** in formal documents
- **Be specific** â€” avoid "etc.", "and so on", "various"

## Document Structure
- Level-1 heading: document title
- Level-2 heading: ## Purpose â€” always second section
- Subsequent sections organized logically
- ## See Also at end for cross-references
- Every document must have a Purpose section

## Cross-Referencing
- Reference other documents by name: See JSON_STANDARD.md
- Reference entities by ID: See hero_000001
- Link to related standards at document end
- Use relative paths for file references: ../standards/JSON_STANDARD.md

## Formatting Rules
- All rules from MARKDOWN_STANDARD.md apply
- Tables for structured data
- Code blocks for examples
- Lists for rules and enumerations
- Headings for section organization
