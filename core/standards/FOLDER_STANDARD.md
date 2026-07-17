# Folder Standard

## Purpose
Defines the standard for directory creation, organization, and hierarchy across Storynaram.

## Directory Naming Rules
- **snake_case** â€” all lowercase with underscores: character_arcs/, magic_systems/
- **Plural** names for entity directories: characters/, items/, spells/
- **Singular** names for concept directories: config/, core/, memory/
- No spaces in directory names
- No special characters (same rules as FILE_STANDARD)
- Maximum directory name length: 60 characters
- Maximum nesting depth: 5 levels from project root

## Directory Structure Rules
`
Storynaram/
â””â”€â”€ domain/              # Domain root â€” always singular or plural concept
    â””â”€â”€ subdomain/       # Subdomain â€” type or category within domain
        â””â”€â”€ entity.json  # Entity files â€” flat within subdomain
`

## Every Directory Must Contain
- README.md â€” explaining purpose, conventions, contents, relationships

## Directory Depth Guidelines
| Depth | Purpose | Example |
|-------|---------|---------|
| 0 | Project root | Storynaram/ |
| 1 | Domains / Functions | characters/, config/, core/ |
| 2 | Subdomains / Categories | characters/heroes/, magic/schools/ |
| 3 | Entity instances (flat) | characters/heroes/hero_a1b2c3.json |
| 4 | Specialized grouping | Rare â€” only for large collections |
| 5 | Maximum depth | Exceptionally rare |

## Directory Purpose Rules
- **Single responsibility** â€” each directory has one clear purpose
- **No mixed content** â€” don't put characters in locations/ or items in magic/
- **Domain isolation** â€” directories do not overlap in responsibility
- **Cross-references** use IDs, not file placement

## Empty Directories
- Empty directories must contain .gitkeep (not tracked by .gitignore)
- Exception: directories that are purely organizational may be empty

## Reserved Directory Names
| Name | Rule |
|------|------|
| config/ | Must exist at root â€” configuration files only |
| core/ | Must exist at root â€” standards and contracts only |
| scripts/ | Must exist at root â€” executable scripts only |
| logs/ | Must exist at root â€” log files only |
| ackups/ | Must exist at root â€” backup files only |
| rchive/ | Must exist at root â€” archived content only |

## Directory Relationships
- Directories do not own other directories
- Relationship between directories is via ID references, not directory hierarchy
- characters/ does NOT contain subdirectories owned by world/
- Cross-domain references always use the Reference type

## Large Directory Management
- When a directory exceeds 10,000 files, consider subdividing by category
- When a directory exceeds 100,000 files, subdivide by first character of ID
- When a directory exceeds 500,000 files, migrate to database

## Git Tracking
- All directories are tracked by git (except backups/, archive/)
- Directory creation (without content) is a valid commit
- README.md should be created with the directory
