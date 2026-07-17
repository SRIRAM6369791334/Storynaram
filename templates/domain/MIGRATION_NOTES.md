# Domain Template Migration Notes

## Migrating from Legacy v0 Entities

If migrating existing unstructured entities to the domain template framework:

### Step 1: Entity Mapping

Map each legacy entity to the appropriate domain template:

| Legacy Pattern | Domain Template |
|----------------|-----------------|
| Person, NPC, Hero | Character |
| Novel, Story, Volume | Book |
| Part, Section | Chapter |
| Paragraph, Beat | Scene |
| Conversation | Dialogue |
| Setting, Universe | World |
| Calendar, Chronology | Timeline |
| Place, Area, Room | Location |
| Nation, Territory | Country |
| Realm, Monarchy | Kingdom |
| Settlement, Town | City |
| Group, Guild, Club | Organization |
| Bloodline, House | Family |
| Sorcery, Spellsystem | Magic |
| Incantation | Spell |
| Skill, Power | Ability |
| Object, Thing | Item |
| Blade, gun | Weapon |
| Shield, Suit | Armor |
| Legendary item | Artifact |
| Task, Adventure | Quest |
| Operation | Mission |
| Tongue, Speech | Language |
| Faith, Worship | Religion |
| Society, People | Culture |
| Creature, Monster | Species |
| Ethnic group | Race |
| Transport, Mount | Vehicle |
| Invention, Machine | Technology |
| Note, Scroll, Record | Document |
| Chart, Atlas | Map |
| Constraint, Law | Rule |
| Official story | Canon |
| Recollection | Memory |

### Step 2: Field Migration

For each field being migrated:

1. **If field exists in a base block** — move it to the appropriate base block
2. **If field is entity-specific** — place it in the `entity` object
3. **If field is deprecated** — mark with `deprecated` metadata and map to new field

### Step 3: ID Migration

Legacy IDs should be preserved in `BaseIdentifier.legacyIds`:

```json
{
  "identifier": {
    "prefix": "char",
    "sequence": "000001",
    "type": "character",
    "legacyIds": [
      { "system": "legacy", "value": "old-char-42", "migratedAt": "2026-07-17T00:00:00Z" }
    ]
  }
}
```

### Step 4: Relationship Migration

Convert legacy relationship fields to `BaseRelationship` format:

```json
{
  "relationships": {
    "relationships": [
      {
        "targetId": "char_000042",
        "targetType": "character",
        "type": "association",
        "role": "parentOf",
        "inverseRole": "childOf"
      }
    ]
  }
}
```

### Step 5: Validation

After migration, run validation on all documents:

```bash
# Validate schema compliance
validate --template domain/Character.template.json --document characters/char_000001.json

# Validate cross-references
validate --cross-references --recursive

# Validate required fields
validate --required --recursive
```

### Step 6: Template Version Upgrades

When upgrading a domain template version (e.g. v1.0 → v1.1):

| Change | Migration Required | Script |
|--------|--------------------|--------|
| New optional field | No | None needed |
| New required field | Yes | Add with default value |
| Field type change | Yes | Transform all values |
| Field removed | Yes | Remove from all documents |
| Enum value added | No | None needed |
| Enum value removed | Yes | Remap or remove values |

### Rollback Procedure

If a migration fails:

1. Restore documents from `BaseHistory.events`
2. Revert the template file
3. Run inverse migration script
4. Pin template version to pre-migration value
5. Re-validate all documents

### Bulk Migration Commands

```bash
# Migrate all character documents to v1.1
migrate --template Character --from 1.0.0 --to 1.1.0

# Dry run (no changes applied)
migrate --template Character --from 1.0.0 --to 1.1.0 --dry-run

# Migrate with progress reporting
migrate --all --from 1.0.0 --to 1.1.0 --progress
```
