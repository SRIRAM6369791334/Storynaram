# Assets Directory

## Purpose
The media asset repository. All visual, audio, and multimedia assets associated with the project.

## Responsibility
Stores and organizes all non-text assets â€” maps, illustrations, character art, cover designs, flags, symbols, diagrams, and any other media files.

## Naming Convention
- **Subdirectories**: Functional categories (e.g., maps/, images/)
- **Files**: {asset_id}.{extension} â€” descriptive names with extensions
- **IDs** follow config/id_rules.json

## Directory Structure
| Subdirectory | Contents |
|-------------|----------|
| maps/ | Map files â€” world maps, regional maps, city maps, battle maps |
| images/ | Illustrations, concept art, scene art, character portraits |
| lags/ | Flag designs â€” national flags, faction flags, heraldic banners |
| symbols/ | Symbol designs â€” sigils, crests, magical symbols, runes |
| diagrams/ | Diagrams â€” magic system diagrams, family trees, relationship charts |
| cover/ | Cover art â€” book covers, series covers, promotional art |

## Future Expansion
- Asset metadata and tagging
- Asset versioning
- Asset relationship mapping
- Thumbnail and preview generation
- Asset search and retrieval
- Image-to-text AI integration
- Asset attribution tracking

## Relationships
- **World/maps** map assets reference world geography
- **Characters/** character portrait assets
- **Organizations/** flag and symbol assets
- **Magic/symbols** magical symbol assets
- **References/** visual reference assets
- **Exports/** assets included in exports
- **Books/cover** cover art assets
