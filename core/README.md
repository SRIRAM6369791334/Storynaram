# Core Directory

## Purpose
The central standards and contracts repository for the entire Storynaram project. Core defines the immutable rules, data contracts, type system, and architectural patterns that govern every file, entity, and operation in the system.

## Responsibility
Serves as the single source of truth for all development standards, data contracts, validators, enumerations, constants, type definitions, indexing strategies, and relationship models. Nothing in Storynaram operates outside the rules defined here.

## Naming Convention
- **Directories**: Functional categories â€” one concern per directory
- **Files**: UPPER_SNAKE_CASE.md for standards, PascalCase.md for contracts
- **Every** directory must contain a README.md

## Directory Structure
| Directory | Purpose |
|-----------|---------|
| standards/ | Development standards â€” JSON, Markdown, IDs, versions, naming, metadata |
| contracts/ | Data contracts for every entity type â€” Character, World, Book, etc. |
| interfaces/ | Interface definitions for system interactions |
| alidators/ | Validation rules, strategies, and error codes |
| constants/ | System-wide constants â€” formats, extensions, defaults |
| enums/ | Standard enumerations for status, types, categories |
| 	ypes/ | Reusable data type definitions |
| indexes/ | Indexing strategies for search and retrieval |
| elationships/ | Entity relationship models and cross-domain links |

## Future Expansion
- Machine-readable schema definitions (JSON Schema / TypeScript)
- Automated contract conformance testing
- Interface code generation for multiple languages
- Runtime validation engine
- Relationship graph database schema

## Relationships
- **config/** reads from and conforms to core standards
- **Every domain directory** follows contracts defined here
- **schemas/** implements the contracts as JSON Schema
- **templates/** implements contracts as reusable templates
- **scripts/validation** validates against contracts
- **memory/** uses relationship models from core
