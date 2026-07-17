# File Standard

## Purpose
Defines the standard for file creation, naming, organization, and management across Storynaram.

## File Naming Rules
- **snake_case** for data files: character_hero_a1b2c3.json, world_map_01.json
- **PascalCase** for definition files: Character.schema.json, BookContract.md
- **UPPER_SNAKE_CASE** for standards: JSON_STANDARD.md, ID_STANDARD.md
- **README.md** â€” case-sensitive, must be exactly this
- No spaces in filenames â€” use hyphens or underscores
- No special characters: @, #, $, %, ^, &, *, (, ), +, =, {, }, [, ], |, \, :, ;, ", ', <, >, ,, ?, /
- Allowed separators: _ (underscore), - (hyphen), . (dot)
- Maximum filename length: 120 characters (including extension)
- Maximum path length: 240 characters

## File Extensions
| Extension | Type | Use |
|-----------|------|-----|
| .json | Data | All entity instances, config, schemas |
| .md | Documentation | READMEs, standards, contracts, guides |
| .ps1 | Script | PowerShell automation scripts |
| .py | Script | Python automation scripts |
| .js | Script | JavaScript/Node.js scripts |
| .ts | Script | TypeScript definition files |
| .png | Image | Portable network graphics |
| .jpg/.jpeg | Image | Photographic images |
| .svg | Image | Vector graphics and diagrams |
| .pdf | Document | Exportable documents |
| .epub | Export | eBook format |
| .csv | Data | Tabular data exchange |
| .yaml/.yml | Config | YAML configuration (config/ only) |

## File Size Limits
- Individual JSON files: maximum 1MB
- Individual Markdown files: maximum 500KB
- Individual images: maximum 50MB
- Script files: maximum 5MB
- Log files: maximum 100MB before rotation

## File Encoding
- .json, .md, .ps1, .py, .js, .ts, .yaml, .yml, .csv: UTF-8 without BOM
- .png, .jpg, .svg: binary â€” no encoding
- .pdf, .epub: binary â€” no encoding

## Line Endings
- **LF** (Unix line endings) for all text files â€” not CRLF
- .gitignore should include .gitattributes to enforce LF normalization
- Exception: .ps1 files may use CRLF on Windows

## Trailing Newline
- Every text file must end with a single trailing newline
- No trailing whitespace on any line

## File Organization Rules
- One entity per file â€” no bundling multiple entities in one file
- One schema per file â€” no bundling multiple schemas
- One contract per file â€” no bundling multiple contracts
- One standard per file â€” single responsibility for standards

## Empty Files
- Empty directories must contain a .gitkeep file
- Empty JSON files must contain {}
- Empty Markdown files are not permitted

## File Metadata
- Every entity JSON file must contain a metadata block
- Metadata includes: createdAt, updatedAt, ersion, status
- See METADATA_STANDARD.md for full specification
