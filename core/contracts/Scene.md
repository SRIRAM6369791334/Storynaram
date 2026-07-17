# Scene Contract

## Purpose
Defines the data contract for scene entities in Storynaram. Scenes are the atomic narrative units.

## Entity Type
`scene`

## Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Scene ID: `scene_000001` |
| `type` | string | Yes | Must be `"scene"` |
| `name` | string | Yes | Scene title or summary |
| `description` | string | Recommended | Extended scene description |
| `metadata` | object | Yes | Standard metadata block |
| `data` | object | Yes | Scene-specific data |
| `relationships` | object | Yes | Relationship references |
| `tags` | array | Recommended | Tags per TAG_STANDARD |

## Data Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chapter` | string | Yes | Parent chapter ID |
| `sceneNumber` | integer | Yes | Scene number within chapter |
| `pov` | string | Yes | POV character ID |
| `characters` | array | Yes | Characters present in scene |
| `location` | string | Yes | Location ID |
| `time.timeOfDay` | string | Optional | dawn, morning, noon, afternoon, evening, night |
| `time.season` | string | Optional | spring, summer, autumn, winter |
| `wordCount` | integer | Optional | Scene word count |
| `goal` | string | Recommended | What this scene must accomplish |
| `conflict` | string | Recommended | Central conflict |
| `tone` | string | Optional | Tone description |
| `summary` | string | Recommended | Brief scene summary |

## Scene Types
`action` | `dialogue` | `exposition` | `transition` | `climax` | `resolution` | `flashback`

## Relationships
| Field | Cardinality | Description |
|-------|-------------|-------------|
| `parent` | 1 | Parent chapter ID |
| `children` | 0-N | Sub-scenes |
| `related` | 0-N | Related entities (dialogues, plot points) |

## Validation Rules
1. `chapter` must reference an existing chapter
2. `pov` must reference an existing character
3. `location` must reference an existing location
4. All characters in `characters` array must exist
5. POV character must be in the characters array

## Scene Lifecycle
`planned` → `written` → `revised` → `polished` → `final` → `removed`

## Example
```json
{
  "id": "scene_000001",
  "type": "scene",
  "name": "The Exiled King's Return",
  "metadata": {
    "version": 1,
    "status": "draft",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z"
  },
  "data": {
    "chapter": "chapter_000001",
    "sceneNumber": 1,
    "pov": "hero_000001",
    "characters": ["hero_000001", "support_000001"],
    "location": "location_000001",
    "time": {
      "timeOfDay": "dawn",
      "season": "spring"
    },
    "wordCount": 2500,
    "goal": "Establish Aldric's return",
    "conflict": "Aldric vs. his own fear",
    "tone": "hopeful yet tense",
    "summary": "Aldric arrives at Dawnhaven port"
  },
  "relationships": {
    "parent": "chapter_000001",
    "children": [],
    "related": ["dialogue_000001", "plot_main_000001"]
  },
  "tags": ["introduction", "point-of-view"]
}
```
