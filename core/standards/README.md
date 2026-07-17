# Standards Directory

## Purpose
The definitive reference for every development standard used across the Storynaram project. These standards are immutable rules â€” not suggestions.

## Responsibility
Defines, documents, and enforces the technical standards for JSON formatting, Markdown conventions, file organization, folder structure, ID generation, versioning, tagging, referencing, naming, metadata, schema design, templates, AI interaction, documentation, validation, change management, and Git usage.

## Files
| File | Scope |
|------|-------|
| JSON_STANDARD.md | JSON formatting, structure, and convention rules |
| MARKDOWN_STANDARD.md | Markdown syntax and documentation conventions |
| FILE_STANDARD.md | File naming, organization, and management rules |
| FOLDER_STANDARD.md | Directory structure and hierarchy conventions |
| ID_STANDARD.md | Global unique ID generation and format |
| VERSION_STANDARD.md | Semantic versioning for project and entities |
| TAG_STANDARD.md | Tag taxonomy and usage conventions |
| REFERENCE_STANDARD.md | Cross-entity referencing and linking |
| NAMING_STANDARD.md | Naming conventions for all project elements |
| METADATA_STANDARD.md | Standard metadata fields for all entities |
| SCHEMA_STANDARD.md | Schema design principles and conventions |
| TEMPLATE_STANDARD.md | Template structure and usage conventions |
| AI_STANDARD.md | AI interaction rules and safety guidelines |
| DOCUMENTATION_STANDARD.md | Documentation writing standards |
| VALIDATION_STANDARD.md | Validation strategy and rule definitions |
| CHANGE_POLICY.md | Change management and deprecation policy |
| GIT_STANDARD.md | Git workflow and version control rules |
| PROJECT_RULES.md | Overarching project governance rules |

## Naming Convention
- UPPER_SNAKE_CASE.md â€” consistent, scannable, unambiguous
- One standard per file â€” single responsibility

## Relationships
- **contracts/** implements data contracts using these standards
- **validators/** enforces these standards programmatically
- **constants/** provides values referenced by these standards
- **scripts/validation** validates conformance to these standards
