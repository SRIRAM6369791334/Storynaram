# Config Directory

## Purpose
Central configuration management for the entire Storynaram project. This directory serves as the single source of truth for all project-wide settings, rules, and metadata.

## Responsibility
Governs how Storynaram operates by defining project identity, AI behavior, writing constraints, naming conventions, versioning, and identification schemas. Every tool, script, and AI agent reads configuration from this directory.

## Naming Convention
- **JSON files**: lowercase_with_underscores.json (e.g., i_rules.json)
- **No subdirectories** â€” all configuration lives at this level for immediate discoverability

## Files
| File | Purpose |
|------|---------|
| project.json | Project name, description, author, language, genre, target audience |
| settings.json | Global application settings, paths, feature flags |
| metadata.json | Project metadata â€” created date, last modified, version history references |
| ersion.json | Versioning scheme, current version, version history pointers |
| i_rules.json | Rules constraining AI behavior â€” response style, guardrails, content policies |
| writing_rules.json | Writing constraints â€” show vs tell, pacing rules, structural rules |
| 
aming_rules.json | Naming conventions for characters, places, items, organizations |
| id_rules.json | ID generation schema â€” UUID format, prefixes, suffixes, patterns |
| README.md | This file |

## Future Expansion
- Environment-specific configuration (dev/staging/production)
- Plugin configuration registry
- Feature toggle system
- AI model selection and parameter configuration
- Multi-language locale settings

## Relationships
- **All directories** reference config for naming and ID rules
- **Scripts/** reads config to determine behavior
- **Memory/** uses config rules for consistency validation
- **Templates/** may reference config for structural defaults
