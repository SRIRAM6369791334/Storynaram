# Version Standard

## Purpose
Defines the versioning system for Storynaram â€” project-wide versions, entity-level versions, schema versions, and template versions.

## Semantic Versioning
All Storynaram versioning follows [Semantic Versioning 2.0.0](https://semver.org/):

`
MAJOR.MINOR.PATCH
`

- **MAJOR** â€” incompatible changes (breaking changes to data structure)
- **MINOR** â€” backward-compatible additions (new fields, new entities)
- **PATCH** â€” backward-compatible fixes (corrections, documentation)

## Project Version
- Stored in config/version.json
- Format: { "version": "0.1.0", "build": "20260717", "phase": "foundation" }
- Incremented according to semantic versioning rules
- Major changes to architecture increment MAJOR
- New standards or contracts increment MINOR
- Corrections to existing content increment PATCH

## Entity-Level Version
Every entity JSON tracks its own version in the metadata block:

`json
{
  "metadata": {
    "version": 1,
    "versionHistory": [
      { "version": 1, "date": "2026-07-17T12:00:00Z", "change": "Initial creation" }
    ]
  }
}
`

- Starts at 1 for new entities
- Incremented by 1 for each modification
- No upper limit on entity version number
- When an entity is archived, the version is frozen

## Schema Version
- Schema files carry their own version in the filename: Character.schema.v1.json
- Schema versions are independent of project versions
- Schema MAJOR bump indicates breaking field changes
- Schema MINOR bump indicates new optional fields
- Schema PATCH bump indicates constraint relaxations

## Template Version
- Template files carry version in metadata: "templateVersion": "1.0.0"
- Template versions are independent of schema versions
- Templates may reference specific schema versions

## JSON File Version Tracking
Every JSON file must track version in its metadata block:

| Field | Type | Description |
|-------|------|-------------|
| ersion | integer | Current version number |
| ersionHistory | array | Array of version records |
| ersionHistory[].version | integer | Version number |
| ersionHistory[].date | string | ISO 8601 timestamp |
| ersionHistory[].change | string | Description of change |

## Version Compatibility
- Breaking changes require a MAJOR version bump
- Breaking changes must be documented in CHANGELOG.md
- Breaking changes must include a migration path
- Schema validators must support the current and immediately previous MAJOR version
- After 2 MAJOR versions, the oldest version may be deprecated

## Version Storage Locations
| What | Where |
|------|-------|
| Project version | config/version.json |
| Entity versions | Each entity's metadata.version |
| Schema versions | schemas/ filename convention |
| Template versions | Template metadata block |
| Changelog | CHANGELOG.md (root) |
| Version rules | This document |
