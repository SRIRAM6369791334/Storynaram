# World Directory

## Purpose
The canonical repository for all world-building data. Every physical, geographical, ecological, and cosmological aspect of the story universe is defined and stored here.

## Responsibility
Maintains the authoritative definition of the story world â€” its geography, physics, climate, ecology, and spatial hierarchies. This directory answers every question about where things are and how the world works.

## Naming Convention
- **Subdirectories**: plural_lowercase (e.g., continents/, mountains/)
- **Files**: snake_case.json â€” one JSON file per distinct entity
- **world.json**: The root world definition file

## Directory Structure
| Subdirectory | Contents |
|-------------|----------|
| physics/ | World physics rules â€” gravity, magic laws, elemental forces |
| continents/ | Continent definitions â€” boundaries, climate zones, regions |
| countries/ | Sovereign nation definitions |
| kingdoms/ | Monarchical state definitions |
| empires/ | Imperial domain definitions |
| states/ | State/province-level political entities |
| provinces/ | Sub-national administrative regions |
| districts/ | Local administrative divisions |
| cities/ | Urban settlement definitions |
| illages/ | Rural settlement definitions |
| orests/ | Forested area definitions |
| mountains/ | Mountain range and peak definitions |
| ivers/ | River system definitions |
| oceans/ | Ocean and sea definitions |
| islands/ | Island and archipelago definitions |
| caves/ | Cave system definitions |
| dungeons/ | Dungeon and ruin definitions |
| landmarks/ | Notable landmark definitions |
| maps/ | Map data, projections, coordinate systems |
| climate/ | Climate zone definitions and patterns |
| weather/ | Weather patterns and magical weather phenomena |
| ecology/ | Ecosystem, biome, and environmental definitions |

## Future Expansion
- 3D coordinate system integration
- Procedural world generation tooling
- Map tile rendering pipeline
- Climate simulation engine
- Tectonic plate modeling

## Relationships
- **Characters/** reference world locations as origins and current locations
- **Timeline/** events occur at world locations
- **Locations/** may link to world geography for spatial queries
- **Magic/** defines how world physics interacts with magical systems
- **Technology/** defines how world resources shape technological development
