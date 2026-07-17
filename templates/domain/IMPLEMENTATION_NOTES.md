# Domain Template Implementation Notes

## Step 1: Understand the Inheritance

Each domain template extends `BaseEntity` and selects a subset of base blocks. The `inherits` array in each template declares which base blocks it uses.

**Rule:** Never add a field to a domain template if it already exists in a base block.

## Step 2: Creating Entity Documents

To create an entity document from a template:

1. Copy the `.template.json` as a starting point
2. Fill all `identifier` fields (prefix from `config/id_rules.json`, zero-padded sequence)
3. Fill all required `metadata` fields (title, language)
4. Fill all required `audit` fields (createdBy, createdAt, updatedBy, updatedAt)
5. Add optional base blocks as needed (version, status, tags, etc.)
6. Fill entity-specific fields in the `entity` block

## Step 3: Cross-Reference Validation

When populating reference arrays (e.g. `entity.characters`, `entity.location`):

- Values should be entity IDs (`{prefix}_{sequence}`)
- Cross-validate that referenced entities exist
- Bidirectional references should be consistent

## Step 4: Template Versioning

When modifying a domain template:

1. Bump `version` field (semver)
2. Update `BaseVersion.templateVersion` in generated documents
3. Create migration script if field types or required status change
4. Validate all existing documents after migration

## Step 5: Adding a New Domain Template

1. Determine entity prefix (register in `config/id_rules.json` if new)
2. Create `{Type}.template.json` — extend BaseEntity, select base blocks
3. Add entity-specific fields in the `entity` object
4. Create `{TYPE}.md` with documentation
5. Add to `README.md` table
6. Update `DOMAIN_DIAGRAMS.md` diagrams
7. Update `RELATIONSHIP_MATRIX.md`

## Step 6: Entity Type Prefixes

Each domain template maps to a prefix in `config/id_rules.json`:

| Template | Prefix | Entity Type |
|----------|--------|-------------|
| Character | char | character |
| Book | book | book |
| Chapter | chpt | chapter |
| Scene | scene | scene |
| Dialogue | dial | dialogue |
| World | world | world |
| Timeline | time | timeline |
| TimelineEvent | tevt | timeline-event |
| Location | loc | location |
| Country | cntry | country |
| Kingdom | king | kingdom |
| City | city | city |
| Organization | org | organization |
| Family | fam | family |
| Magic | magic | magic |
| Spell | spell | spell |
| Ability | abil | ability |
| Item | item | item |
| Weapon | wpn | weapon |
| Armor | armr | armor |
| Artifact | artfct | artifact |
| Quest | quest | quest |
| Mission | miss | mission |
| Language | lang | language |
| Religion | rel | religion |
| Culture | cultr | culture |
| Species | spcs | species |
| Race | race | race |
| Vehicle | veh | vehicle |
| Technology | tech | technology |
| Document | doc | document |
| Map | map | map |
| Rule | rule | rule |
| Canon | canon | canon |
| Memory | mem | memory |

## Step 7: AI Configuration

For AI-visible entity types, configure `BaseAI` in the entity document:

- Set `visibility` to "visible" for entities the AI should access
- Set `canon.importance` based on narrative significance
- Enable `embedding` for semantic search
- Configure `retrieval.contextPriority` for context window allocation

## Step 8: Search Configuration

For searchable entity types:

- Enable `BaseSearch.fullText` on relevant text fields
- Configure boost values for important fields (e.g. title > description)
- Enable semantic search for AI-powered queries

## Performance Considerations

- **Entity nesting**: Prefer references over nested objects for 1:N relationships
- **Document size**: Keep entity documents under 100KB for optimal storage and retrieval
- **Base block selection**: Include only needed base blocks to reduce document size
- **Index strategy**: Create database indexes on frequently queried fields via BaseIndex
