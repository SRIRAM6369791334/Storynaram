# Naming Standard

## Purpose
Defines naming conventions for all named elements in Storynaram — entities, files, directories, fields, variables, and display names.

## Entity Display Names
- **Title Case** for characters, locations, organizations: `"King Aldric the Brave"`
- **Title Case** for books, chapters, scenes: `"The Crystal Throne"`
- **Proper capitalization** — always capitalize proper nouns
- **No ALL CAPS** except acronyms
- **Maximum length**: 120 characters

## Character Names
- First name + Last name format where applicable
- Titles included: `"King Aldric III"`
- Nicknames in quotes: `"Aldric \"the Brave\" Stormwind"`

## Location Names
- Geographic format: `"The Crimson Mountains"`, `"Lake Serenity"`
- Constructed names follow conlang rules from languages/
- Avoid generic names without context

## Item Names
- Descriptive names: `"Blade of a Thousand Sorrows"`
- Quantity for consumables: `"Healing Potion (x3)"`

## File Naming
| File Type | Format | Example |
|-----------|--------|---------|
| Entity files | `{prefix}_{sequence}.json` | `hero_000001.json` |
| Schema files | `{EntityType}.schema.json` | `Character.schema.json` |
| Template files | `{entity_type}_template.json` | `character_template.json` |
| Standards | `UPPER_SNAKE_CASE.md` | `JSON_STANDARD.md` |
| Contracts | `PascalCase.md` | `Character.md` |
| Directory docs | `README.md` | `README.md` |

## Field Naming (JSON keys)
- **camelCase** — `characterName`, `currentLocation`, `isAlive`
- Acronyms: `aiRules` (not `AIRules`), `jsonSchema` (not `JSONSchema`)
- Avoid abbreviations: `description` (not `desc`)
- Common abbreviations allowed: `id`, `max`, `min`, `avg`, `config`
- Boolean fields: `isActive`, `hasChildren`, `canFly`

## Directory Naming
- **snake_case** — all lowercase with underscores
- Plural for entity collections: `characters/`, `items/`
- Singular for functional directories: `config/`, `core/`
- Numbers zero-padded: `book_001/`

## Product/Brand Naming
- The project is named `Storynaram` — always capitalized
- Never `storynaram`, `STORYNARAM`, or `Story-naram`
- `Storynaram` is one word — not `Story Naram`
