# Metadata Directory

## Purpose
Defines the reusable Metadata Model used by all entities in Storynaram.

## Responsibility
The metadata model provides standardized identity, audit, versioning, status, and reference tracking for every entity. All entities compose these metadata value objects.

## Metadata Model
| Component | Fields | Description |
|-----------|--------|-------------|
| **Identity** | id, type, prefix | Entity identity |
| **Audit** | createdAt, createdBy, updatedAt, updatedBy | Creation/modification tracking |
| **Version** | version, versionHistory | Version management |
| **Status** | status, statusHistory | Lifecycle state |
| **Ownership** | owner, project, book | Ownership context |
| **References** | references, relatedEntities | Cross-entity links |
| **Tags** | tags, categories | Classification |
| **Security** | visibility, permissions | Access control |

## Dependencies
- entities/ â€” all entities use this metadata model
- value_objects/ â€” metadata composed of value objects
