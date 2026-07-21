# Git Standard

## Purpose
Defines the Git workflow and version control standards for Storynaram.

## Repository
- Single repository for the entire project
- No submodules
- Branch strategy: GitHub Flow (main + feature branches)

## Branch Naming
- main â€” production-ready state
- eature/{description} â€” new features: eature/add-magic-schema
- ix/{description} â€” bug fixes: ix/invalid-id-format
- docs/{description} â€” documentation: docs/update-architecture
- efactor/{description} â€” refactoring: efactor/restructure-characters

## Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

`
<type>(<scope>): <description>

[optional body]

[optional footer]
`

### Types
| Type | Usage |
|------|-------|
| eat | New feature or entity type |
| ix | Bug fix or correction |
| docs | Documentation changes |
| style | Formatting, linting |
| efactor | Code/restructure changes |
| perf | Performance improvement |
| 	est | Adding or fixing tests |
| chore | Maintenance, tooling |
| config | Configuration changes |
| standards | Standards changes |

### Scope
- Use directory or domain name: eat(characters):, docs(core):, ix(config):
- No scope for global changes: eat: add new project structure

### Examples
`
feat(characters): add hero entity schema and template

- Define Character.schema.v1.json
- Create character_template.json
- Add VALIDATION_STANDARD reference

Closes #42
`

`
docs(core): update ID_STANDARD with new prefixes

- Add weapon and armor prefixes
- Clarify zero-padding rules
`

## Commit Size
- One logical change per commit
- Small, focused commits preferred over large, sweeping ones
- Exception: initial project setup may be a single commit
- No commits with both content changes AND formatting changes

## File Tracking Rules
- Tracked: All domain directories, config files, core standards, scripts
- Not tracked: ackups/, rchive/, logs/, export outputs
- Use .gitignore for untracked patterns
- Use .gitattributes for line-ending normalization

## Pull Request Standards
- PR title follows commit message format
- PR description explains what and why
- PR references relevant issues
- PR includes validation results if applicable
- One reviewer minimum for non-trivial changes

## Tagging
- Tags follow semantic versioning: 0.1.0, 1.0.0
- Tags are applied to main branch on release
- Annotated tags preferred over lightweight tags

## Backup Before Commit
- Run validators before committing
- Verify no broken references
- Check for unintentional changes
- Review diff before staging
