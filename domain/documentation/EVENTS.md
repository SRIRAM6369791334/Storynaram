# Domain Events Catalog

## Event Definitions and Specifications

---

## 1. Event Model

```json
{
  "eventId": "evt_{seq}",
  "eventType": "string",
  "aggregateType": "string",
  "aggregateId": "string",
  "timestamp": "datetime",
  "actor": "string",
  "data": "object",
  "version": "int"
}
```

---

## 2. Narrative Events

| Event | When | Data Payload |
|-------|------|-------------|
| BookCreated | Book aggregate created | bookId, title, seriesId |
| BookUpdated | Book properties changed | bookId, changedFields |
| BookStatusChanged | Book lifecycle transition | bookId, fromStatus, toStatus |
| BookDeleted | Book archived | bookId, reason |
| ChapterCreated | Chapter added to book | chapterId, bookId, number |
| ChapterUpdated | Chapter content changed | chapterId, changedFields |
| ChapterDeleted | Chapter removed | chapterId, bookId |
| SceneCreated | Scene added to chapter | sceneId, chapterId, bookId |
| SceneUpdated | Scene content changed | sceneId, changedFields |
| SceneDeleted | Scene removed | sceneId, chapterId |
| ArcCreated | Arc added to book | arcId, bookId, arcName |
| ArcCompleted | Arc concluded | arcId, bookId |

---

## 3. Character Events

| Event | When | Data Payload |
|-------|------|-------------|
| CharacterCreated | Character aggregate created | characterId, name, speciesId |
| CharacterUpdated | Character properties changed | characterId, changedFields |
| CharacterDeleted | Character archived | characterId, reason |
| CharacterStatusChanged | Lifecycle transition | characterId, fromStatus, toStatus |
| CharacterAssignedToBook | Character added to book cast | characterId, bookId, role |
| CharacterRemovedFromBook | Character removed from book cast | characterId, bookId |
| RelationshipCreated | Character relationship added | relationshipId, sourceId, targetId, type |
| RelationshipUpdated | Relationship modified | relationshipId, changedFields |
| RelationshipDeleted | Relationship removed | relationshipId |
| InventoryChanged | Character inventory updated | characterId, itemId, action, quantity |

---

## 4. World Events

| Event | When | Data Payload |
|-------|------|-------------|
| WorldCreated | World aggregate created | worldId, name |
| WorldUpdated | World modified | worldId, changedFields |
| LocationCreated | New location added | locationId, worldId, parentId |
| LocationUpdated | Location modified | locationId, changedFields |
| LocationDeleted | Location removed | locationId, reason |
| GeographyChanged | Geography hierarchy modified | worldId, changeType, entityId |

---

## 5. Timeline Events

| Event | When | Data Payload |
|-------|------|-------------|
| TimelineCreated | Timeline aggregate created | timelineId, name |
| TimelineUpdated | Timeline modified | timelineId, changedFields |
| EraCreated | New era defined | eraId, timelineId, dateRange |
| EraUpdated | Era modified | eraId, changedFields |
| EventCreated | Timeline event created | eventId, eraId, timelineId |
| EventUpdated | Event modified | eventId, changedFields |
| EventDeleted | Event removed | eventId, reason |
| TimelineConflictDetected | Chronological conflict found | timelineId, conflictingEvents |

---

## 6. Organization Events

| Event | When | Data Payload |
|-------|------|-------------|
| OrganizationCreated | Organization aggregate created | organizationId, name |
| OrganizationUpdated | Organization modified | organizationId, changedFields |
| OrganizationDeleted | Organization archived | organizationId |
| MemberJoined | Character joined organization | organizationId, characterId, role |
| MemberLeft | Character left organization | organizationId, characterId |
| MemberRoleChanged | Character's org role changed | organizationId, characterId, oldRole, newRole |

---

## 7. Magic Events

| Event | When | Data Payload |
|-------|------|-------------|
| MagicCreated | Magic aggregate created | magicId, systemName |
| MagicUpdated | Magic modified | magicId, changedFields |
| SpellCreated | New spell added | spellId, magicId, name |
| SpellLearned | Character learned spell | spellId, characterId, magicId |
| SpellForgotten | Character forgot spell | spellId, characterId |
| AbilityUnlocked | Character gained ability | abilityId, characterId |

---

## 8. Item Events

| Event | When | Data Payload |
|-------|------|-------------|
| ItemCreated | Item aggregate created | itemId, name, itemType |
| ItemUpdated | Item modified | itemId, changedFields |
| ItemDeleted | Item destroyed/archived | itemId, reason |
| ItemAcquired | Character obtained item | itemId, characterId |
| ItemLost | Character lost item | itemId, characterId, reason |
| ItemTransferred | Item moved between owners | itemId, fromOwnerId, toOwnerId |

---

## 9. Canon Events

| Event | When | Data Payload |
|-------|------|-------------|
| EntityCanonized | Entity marked as canon | entityId, entityType |
| EntityDecanonized | Entity removed from canon | entityId, entityType, reason |
| CanonConflictDetected | Contradiction found | entityIdA, entityIdB, description |
| CanonConflictResolved | Contradiction resolved | conflictId, resolution |

---

## 10. System Events

| Event | When | Data Payload |
|-------|------|-------------|
| EntityImported | Entity batch imported | count, entityType, source |
| EntityExported | Entity batch exported | count, entityType, destination |
| BackupCreated | Data backup completed | backupId, size, timestamp |
| ValidationCompleted | Validation run finished | entityCount, passCount, failCount |
| IndexRebuilt | Search index regenerated | indexName, documentCount |
