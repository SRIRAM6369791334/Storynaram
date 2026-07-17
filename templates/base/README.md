# Base Template Framework

## Purpose

Foundation layer for every entity in Storynaram. All entity templates inherit from these base templates to ensure consistency, reuse, and future-proofing.

## Design Principles

- **Inheritance** — Every entity template extends one or more base templates
- **Composition** — BaseEntity composes all base blocks; entities select what they need
- **Extension** — BaseExtension provides forward-compatible customization points
- **Versioning** — Every template and entity document carries explicit schema/template/entity versions
- **Metadata** — Descriptive + audit + provenance metadata on every entity
- **Cross References** — Internal, external, graph, parent/child, and related references
- **AI Retrieval** — Visibility, embeddings, context priority, retrieval weight, and canonical importance
- **Knowledge Graph** — Relationship types, cardinality, graph mappings for Neo4j
- **Database Migration** — Index definitions for PostgreSQL, Neo4j, vector DB, search engine
- **Plugin System** — BaseExtension enables future plugin registration

## Base Templates

| # | Template | Required | Purpose |
|---|----------|----------|---------|
| 1 | [BaseIdentifier](BaseIdentifier.template.json) | Yes | Unique entity identity |
| 2 | [BaseMetadata](BaseMetadata.template.json) | Yes | Title, description, keywords |
| 3 | [BaseAudit](BaseAudit.template.json) | Yes | Created/updated/approved by |
| 4 | [BaseVersion](BaseVersion.template.json) | No | Schema/template/entity versioning |
| 5 | [BaseStatus](BaseStatus.template.json) | No | Lifecycle state machine |
| 6 | [BaseLifecycle](BaseLifecycle.template.json) | No | State machine with transitions |
| 7 | [BaseOwnership](BaseOwnership.template.json) | No | Owner and container tracking |
| 8 | [BaseReference](BaseReference.template.json) | No | Internal/external/cross references |
| 9 | [BaseRelationship](BaseRelationship.template.json) | No | Typed relationships with cardinality |
| 10 | [BaseTag](BaseTag.template.json) | No | Tags, categories, labels |
| 11 | [BaseVisibility](BaseVisibility.template.json) | No | Publication and visibility control |
| 12 | [BasePermission](BasePermission.template.json) | No | Access control |
| 13 | [BaseLocalization](BaseLocalization.template.json) | No | Multi-language support |
| 14 | [BaseAttachment](BaseAttachment.template.json) | No | File and asset attachments |
| 15 | [BaseComment](BaseComment.template.json) | No | Comments, annotations, reviews |
| 16 | [BaseHistory](BaseHistory.template.json) | No | Change history and event log |
| 17 | [BaseValidation](BaseValidation.template.json) | No | Field and business rule validation |
| 18 | [BaseAI](BaseAI.template.json) | No | AI visibility, embeddings, retrieval |
| 19 | [BaseSearch](BaseSearch.template.json) | No | Full-text, keyword, semantic, hybrid search |
| 20 | [BaseIndex](BaseIndex.template.json) | No | Database index definitions |
| 21 | [BaseSecurity](BaseSecurity.template.json) | No | Encryption, redaction, classification |
| 22 | [BaseExport](BaseExport.template.json) | No | Export formats and destinations |
| 23 | [BaseImport](BaseImport.template.json) | No | Import sources and mapping |
| 24 | [BaseWorkflow](BaseWorkflow.template.json) | No | Workflow stages and assignments |
| 25 | [BaseExtension](BaseExtension.template.json) | No | Plugin and customization points |
| 26 | [BaseEntity](BaseEntity.template.json) | N/A | Universal root — composes all blocks |

## Inheritance Rules

- **Final** properties cannot be overridden by subtype templates
- **Overrideable** properties can be customized per entity type
- **Required** blocks must be present in every entity document
- **Extensible** templates support additional subtype-specific properties

## Usage

```json
{
  "$schema": "https://storynaram.dev/schemas/entity.v1.json",
  "identifier": { "prefix": "char", "sequence": "000001", "type": "character" },
  "metadata": { "title": "Entity Name", "language": "en" },
  "audit": { "createdBy": "system", "createdAt": "2026-07-17T00:00:00Z", "updatedBy": "system", "updatedAt": "2026-07-17T00:00:00Z" }
}
```

## File Count

27 base template files (26 templates + 1 root README)
