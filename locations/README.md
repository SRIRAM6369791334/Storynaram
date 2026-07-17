# Locations Directory

## Purpose
The spatial index for every specific location in the story universe. While world/ defines geographical entities, this directory tracks specific, named locations where scenes and events occur.

## Responsibility
Maps every place a character can stand, a scene can take place, or an event can occur. Locations are the intersection of world geography and narrative necessity.

## Naming Convention
- **Files**: {location_id}.json â€” one file per distinct location
- **IDs** follow config/id_rules.json
- **Structure**: No subdirectories â€” all locations flat for universal access

## Contents
- Specific buildings (castles, taverns, temples, houses)
- Rooms within larger structures
- Natural features used as landmarks
- Meeting places and gathering points
- Hidden or secret locations
- Extra-dimensional or planar locations
- Temporary locations (camps, battlefields, etc.)

## Future Expansion
- Spatial query engine (find locations within radius)
- Location hierarchy mapping
- Travel time and route calculation
- Location state tracking over time
- Scene-to-location binding validation

## Relationships
- **World/** provides the geographical container for locations
- **Scenes/** are bound to specific locations
- **Characters/** reference locations for home, workplace, etc.
- **Timeline/** events occur at locations
- **Items/** may be stored at or found at locations
- **Maps/** in assets provide visual references
