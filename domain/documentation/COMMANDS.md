# Commands Catalog

## Command Definitions for the Domain Layer

---

## 1. Command Model

```json
{
  "commandId": "cmd_{seq}",
  "commandType": "string",
  "aggregateType": "string",
  "aggregateId": "string",
  "timestamp": "datetime",
  "actor": "string",
  "data": "object"
}
```

---

## 2. Narrative Commands

| Command | Target | Parameters | Returns |
|---------|--------|------------|---------|
| CreateBook | Book | title, seriesId, volume | BookId |
| UpdateBook | Book | bookId, field updates | boolean |
| ChangeBookStatus | Book | bookId, newStatus, reason | boolean |
| DeleteBook | Book | bookId, reason | boolean |
| AddChapter | Book.BookId | title, number, pov | ChapterId |
| UpdateChapter | Chapter | chapterId, field updates | boolean |
| RemoveChapter | Chapter | chapterId | boolean |
| AddScene | Chapter.ChapterId | title, characterIds, locationId | SceneId |
| UpdateScene | Scene | sceneId, field updates | boolean |
| RemoveScene | Scene | sceneId | boolean |
| AddDialogue | Scene.SceneId | speakerId, text, direction | DialogueId |
| RemoveDialogue | Dialogue | dialogueId | boolean |
| CreateArc | Book.BookId | name, type, description | ArcId |
| UpdateArc | Arc | arcId, field updates | boolean |
| CompleteArc | Arc | arcId | boolean |

---

## 3. Character Commands

| Command | Target | Parameters | Returns |
|---------|--------|------------|---------|
| CreateCharacter | Character | name, speciesId, raceId, archetype | CharacterId |
| UpdateCharacter | Character | characterId, field updates | boolean |
| UpdateCharacterStatus | Character | characterId, newStatus | boolean |
| DeleteCharacter | Character | characterId, reason | boolean |
| AssignToBook | Character | characterId, bookId, role | boolean |
| RemoveFromBook | Character | characterId, bookId | boolean |
| CreateRelationship | Character | sourceId, targetId, type, strength | RelationshipId |
| UpdateRelationship | Relationship | relationshipId, field updates | boolean |
| RemoveRelationship | Relationship | relationshipId | boolean |
| AddInventoryItem | Character | characterId, itemId, slot, quantity | boolean |
| RemoveInventoryItem | Inventory | inventoryId | boolean |
| AddFamilyMember | Character | characterId, relativeId, relationType | FamilyId |
| RemoveFamilyMember | Family | familyId | boolean |
| AddMemory | Character | characterId, eventId, description | MemoryId |

---

## 4. World Commands

| Command | Target | Parameters | Returns |
|---------|--------|------------|---------|
| CreateWorld | World | name, type, description | WorldId |
| UpdateWorld | World | worldId, field updates | boolean |
| DeleteWorld | World | worldId | boolean |
| AddContinent | World | worldId, name, description | ContinentId |
| AddCountry | Continent | continentId, name, government | CountryId |
| AddProvince | Country | countryId, name, ruler | ProvinceId |
| AddDistrict | Province | provinceId, name, type | DistrictId |
| AddCity | District | districtId, name, population | CityId |
| AddVillage | District | districtId, name, population | VillageId |
| AddLocation | City/Village | parentId, name, type, coordinates | LocationId |
| UpdateGeography | Location | locationId, field updates | boolean |
| RemoveLocation | Location | locationId | boolean |

---

## 5. Timeline Commands

| Command | Target | Parameters | Returns |
|---------|--------|------------|---------|
| CreateTimeline | Timeline | name, description | TimelineId |
| UpdateTimeline | Timeline | timelineId, field updates | boolean |
| AddEra | Timeline | timelineId, name, dateRange | EraId |
| UpdateEra | Era | eraId, field updates | boolean |
| AddEvent | Era | eraId, name, date, participants | EventId |
| UpdateEvent | Event | eventId, field updates | boolean |
| RemoveEvent | Event | eventId | boolean |
| AddCalendar | Timeline | timelineId, name, months, days | CalendarId |
| ResolveConflict | Timeline | timelineId, eventIdA, eventIdB, resolution | boolean |

---

## 6. Organization Commands

| Command | Target | Parameters | Returns |
|---------|--------|------------|---------|
| CreateOrganization | Organization | name, type, headquarters | OrganizationId |
| UpdateOrganization | Organization | organizationId, field updates | boolean |
| DeleteOrganization | Organization | organizationId | boolean |
| AddBranch | Organization | organizationId, name, location, leader | BranchId |
| AddMember | Organization | organizationId, characterId, role, rank | MemberId |
| UpdateMemberRole | Organization | memberId, newRole | boolean |
| RemoveMember | Organization | memberId, reason | boolean |

---

## 7. Magic Commands

| Command | Target | Parameters | Returns |
|---------|--------|------------|---------|
| CreateMagic | Magic | systemName, type, source, cost | MagicId |
| UpdateMagic | Magic | magicId, field updates | boolean |
| AddSpell | Magic | magicId, name, school, power | SpellId |
| UpdateSpell | Spell | spellId, field updates | boolean |
| AddSkill | Magic | magicId, name, type, level | SkillId |
| AddAbility | Magic | magicId, name, type, cooldown | AbilityId |
| AssignSpellToCharacter | Character | characterId, spellId | boolean |
| RemoveSpellFromCharacter | Character | characterId, spellId | boolean |

---

## 8. Item Commands

| Command | Target | Parameters | Returns |
|---------|--------|------------|---------|
| CreateItem | Item | name, type, description, weight | ItemId |
| UpdateItem | Item | itemId, field updates | boolean |
| DeleteItem | Item | itemId | boolean |
| AddVariation | Item | itemId, name, material, quality | VariationId |
| TransferItem | Item | itemId, fromOwnerId, toOwnerId | boolean |
| ConsumeItem | Inventory | inventoryId | boolean |

---

## 9. Canon Commands

| Command | Target | Parameters | Returns |
|---------|--------|------------|---------|
| CanonizeEntity | Entity | entityId, entityType | boolean |
| DecanonizeEntity | Entity | entityId, entityType, reason | boolean |
| ResolveCanonConflict | Conflict | conflictId, resolution, approvedBy | boolean |

---

## 10. Import/Export Commands

| Command | Target | Parameters | Returns |
|---------|--------|------------|---------|
| ImportEntities | Batch | entityType, sourceData, format | ImportResult |
| ExportEntities | Batch | entityType, format, filter | ExportData |
| BackupProject | Project | projectId | BackupId |
| RestoreProject | Project | projectId, backupId | boolean |
