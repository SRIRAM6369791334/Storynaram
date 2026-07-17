# Queries Catalog

## Query Definitions for the Domain Layer

---

## 1. Query Model

```json
{
  "queryId": "qry_{seq}",
  "queryType": "string",
  "parameters": "object",
  "filters": "object",
  "projection": "string[]",
  "pagination": {
    "page": "int",
    "pageSize": "int"
  }
}
```

---

## 2. Narrative Queries

| Query | Description | Parameters | Returns |
|-------|-------------|------------|---------|
| GetBook | Single book by ID | bookId | Book entity |
| GetBookByTitle | Find book by title | title, seriesId? | Book entity |
| ListBooksBySeries | All books in a series | seriesId, status? | Book[] |
| ListBooksByStatus | Books by lifecycle status | status, seriesId? | Book[] |
| GetChapter | Single chapter | chapterId | Chapter entity |
| ListChaptersByBook | All chapters in book | bookId, sortOrder? | Chapter[] |
| GetScene | Single scene | sceneId | Scene entity |
| ListScenesByChapter | All scenes in chapter | chapterId, sortOrder? | Scene[] |
| ListScenesByCharacter | Scenes featuring character | characterId | Scene[] |
| ListScenesByLocation | Scenes at location | locationId | Scene[] |
| GetDialogue | Single dialogue | dialogueId | Dialogue entity |
| ListDialoguesByScene | All dialogue in scene | sceneId, sortOrder? | Dialogue[] |
| GetArc | Single story arc | arcId | Arc entity |
| ListArcsByBook | All arcs in book | bookId | Arc[] |
| SearchNarrative | Full-text narrative search | query, filters, pagination | SearchResult[] |

---

## 3. Character Queries

| Query | Description | Parameters | Returns |
|-------|-------------|------------|---------|
| GetCharacter | Single character | characterId | Character entity |
| GetCharacterByName | Find by name | name, exact? | Character[] |
| ListCharactersBySpecies | Characters of a species | speciesId | Character[] |
| ListCharactersByRace | Characters of a race | raceId | Character[] |
| ListCharactersByBook | Characters in a book | bookId, role? | Character[] |
| ListCharactersByArchetype | Characters of archetype | archetype | Character[] |
| ListCharactersByStatus | By lifecycle status | status | Character[] |
| GetRelationship | Single relationship | relationshipId | Relationship entity |
| ListRelationships | All relationships for character | characterId, type? | Relationship[] |
| GetInventory | Character's inventory | characterId | Inventory[] |
| GetFamily | Character's family tree | characterId | Family[] |
| GetMemories | Character's memories | characterId, eventId? | Memory[] |
| SearchCharacters | Full-text search | query, filters, pagination | SearchResult[] |

---

## 4. World Queries

| Query | Description | Parameters | Returns |
|-------|-------------|------------|---------|
| GetWorld | Single world | worldId | World entity |
| ListWorlds | All worlds in project | projectId | World[] |
| GetContinent | Single continent | continentId | Continent entity |
| ListContinents | All continents in world | worldId | Continent[] |
| GetCountry | Single country | countryId | Country entity |
| ListCountriesByContinent | Countries in continent | continentId | Country[] |
| GetProvince | Single province | provinceId | Province entity |
| ListProvincesByCountry | Provinces in country | countryId | Province[] |
| GetDistrict | Single district | districtId | District entity |
| ListDistrictsByProvince | Districts in province | provinceId | District[] |
| GetCity | Single city | cityId | City entity |
| ListCitiesByDistrict | Cities in district | districtId | City[] |
| GetVillage | Single village | villageId | Village entity |
| ListLocationsByParent | Sub-locations of parent | parentId, type? | Location[] |
| GetLocation | Single location | locationId | Location entity |
| SearchLocations | Search by name/type/coords | query, filters, pagination | SearchResult[] |

---

## 5. Timeline & Event Queries

| Query | Description | Parameters | Returns |
|-------|-------------|------------|---------|
| GetTimeline | Single timeline | timelineId | Timeline entity |
| ListTimelines | All timelines in project | projectId | Timeline[] |
| GetEra | Single era | eraId | Era entity |
| ListErasByTimeline | All eras in timeline | timelineId | Era[] |
| GetEvent | Single event | eventId | Event entity |
| ListEventsByEra | Events in era | eraId, sortBy? | Event[] |
| ListEventsByCharacter | Events involving character | characterId | Event[] |
| ListEventsByDateRange | Events within date range | startDate, endDate, timelineId | Event[] |
| ListEventsByLocation | Events at location | locationId | Event[] |
| GetCalendar | Single calendar | calendarId | Calendar entity |
| SearchEvents | Full-text event search | query, filters, pagination | SearchResult[] |

---

## 6. Organization Queries

| Query | Description | Parameters | Returns |
|-------|-------------|------------|---------|
| GetOrganization | Single organization | organizationId | Organization entity |
| ListOrganizationsByType | Filter by type | type, worldId? | Organization[] |
| ListOrganizationsByCharacter | Orgs character belongs to | characterId | Organization[] |
| GetBranch | Single branch | branchId | Branch entity |
| ListBranches | All branches of organization | organizationId | Branch[] |
| ListMembers | Members of organization | organizationId, role? | Member[] |

---

## 7. Magic Queries

| Query | Description | Parameters | Returns |
|-------|-------------|------------|---------|
| GetMagicSystem | Single magic system | magicId | Magic entity |
| ListMagicSystems | All magic systems | projectId | Magic[] |
| GetSpell | Single spell | spellId | Spell entity |
| ListSpellsByMagic | Spells in system | magicId, school? | Spell[] |
| ListSpellsByCharacter | Spells known by character | characterId | Spell[] |
| GetSkill | Single skill | skillId | Skill entity |
| ListSkillsByCharacter | Skills of character | characterId | Skill[] |
| GetAbility | Single ability | abilityId | Ability entity |
| ListAbilitiesByCharacter | Abilities of character | characterId | Ability[] |

---

## 8. Item Queries

| Query | Description | Parameters | Returns |
|-------|-------------|------------|---------|
| GetItem | Single item | itemId | Item entity |
| ListItemsByType | Filter by type | type, worldId? | Item[] |
| ListItemsByOwner | Items owned by character | characterId | Item[] |
| ListItemsByLocation | Items stored at location | locationId | Item[] |
| SearchItems | Search by name/type/rarity | query, filters, pagination | SearchResult[] |

---

## 9. Cross-Domain Queries

| Query | Description | Parameters | Returns |
|-------|-------------|------------|---------|
| GetEntityTimeline | Timeline of events for any entity | entityId, entityType | TimelineEvent[] |
| GetEntityRelations | All relationships for entity | entityId, entityType | Relationship[] |
| GetBookSummary | Concise book summary | bookId | BookSummary |
| GetCharacterProfile | Full character profile | characterId | CharacterProfile |
| GetLocationDetails | Location with all events/items | locationId | LocationDetails |
| GetProjectOverview | Complete project overview | projectId | ProjectSummary |

---

## 10. Search & Aggregation Queries

| Query | Description | Parameters | Returns |
|-------|-------------|------------|---------|
| FullTextSearch | Cross-entity full-text search | query, entityTypes, filters | SearchResult[] |
| CountByType | Entity counts by type | projectId | Map<type, count> |
| CountByStatus | Entity counts by status | projectId, entityType | Map<status, count> |
| CountBooksBySeries | Book count per series | projectId | Map<series, count> |
| CharacterArcAnalysis | Character arc progression | characterId | ArcAnalysis |
| WorldPopulationSummary | Population statistics | worldId | PopulationSummary |
