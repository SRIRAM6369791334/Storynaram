# Metadata Specifications

## Data about Data — Entity Metadata Architecture

---

## 1. Metadata Model

All entities share a common metadata structure:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| entityId | string | Yes | Globally unique ID |
| entityType | string | Yes | Entity type discriminator |
| version | int | Yes | Monotonic version counter |
| createdAt | datetime | Yes | Entity creation timestamp |
| createdBy | string | Yes | Creator user/system |
| updatedAt | datetime | Yes | Last modification timestamp |
| updatedBy | string | Yes | Last modifier |
| status | StatusEnum | Yes | Lifecycle status |
| previousStatus | StatusEnum | No | Immediate prior status |
| statusChangedAt | datetime | No | When status changed |
| statusChangedBy | string | No | Who changed status |
| statusReason | string | No | Why status changed |
| tags | Tag[] | No | Associative tags |
| references | Reference[] | No | Cross-entity references |
| auditTrail | AuditEntry[] | No | Change history log |
| isCanon | boolean | Yes | Whether entity is canon |
| canonVersion | int | No | Canon revision number |
| locale | string | No | Language/locale code |
| source | string | No | Origin of the data |
| confidence | float | No | AI confidence (0.0-1.0) |

---

## 2. Audit Entry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| timestamp | datetime | Yes | When change occurred |
| actor | string | Yes | Who made the change |
| action | string | Yes | Create, Update, StatusChange, Delete |
| field | string | No | Which field changed |
| oldValue | string | No | Previous value |
| newValue | string | No | New value |
| reason | string | No | Reason for change |

---

## 3. Tag Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Tag text |
| category | string | No | Namespace/category |
| color | string | No | Hex color code |
| weight | float | No | Importance weight |

### Tag Categories

| Category | Example Tags | Purpose |
|----------|-------------|---------|
| Genre | fantasy, sci-fi, romance | Content classification |
| Mood | dark, comedic, tragic | Tone indicator |
| Theme | redemption, power, love | Thematic grouping |
| Content | violence, language, adult | Content warnings |
| Status | wip, needs-revision, complete | Workflow markers |
| Priority | critical, important, optional | Importance level |
| Custom | user-defined | Flexible categorization |

---

## 4. Reference Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| targetId | string | Yes | Referenced entity ID |
| targetType | string | Yes | Referenced entity type |
| role | string | No | Role in the relationship |
| label | string | No | Display label |

---

## 5. Status Definitions

| Status | Code | Description |
|--------|------|-------------|
| Draft | DRAFT | Initial creation, editable |
| Review | REVIEW | Under review |
| Approved | APPROVED | Accepted as final |
| Rejected | REJECTED | Returned for revision |
| Locked | LOCKED | Frozen, no changes |
| Archived | ARCHIVED | Historical record |
| Deleted | DELETED | Soft-deleted |

### Entity-Specific Statuses

| Entity | Additional Statuses |
|--------|-------------------|
| Book | OUTLINE, REVISION, BETA, EDITING, READY, PUBLISHED |
| Character | CONCEPT, DEVELOPED, FINAL |
| World | DEVELOPMENT, FROZEN |
| Scene | PLANNED, WRITTEN, REVISED, POLISHED, REMOVED |
| Event | PROPOSED, PLANNED, OCCURRING, RESOLVED, CANON, DISCARDED |
| Item | AVAILABLE, OWNED, CONSUMED, DESTROYED |
| Organization | ACTIVE, INACTIVE, DEFUNCT |
| Magic | ACTIVE, RESTRICTED, LOST |

---

## 6. Versioning Strategy

| Aspect | Strategy |
|--------|----------|
| Version format | Monotonic integer (1, 2, 3, ...) |
| Increment | Every successful entity update |
| Concurrency | Optimistic locking via version check |
| History | Full audit trail retained |
| Rollback | Supported via previous version snapshot |
| Branching | Not supported at entity level; use Project branches |
| Merging | Not supported at entity level |

---

## 7. Canon Metadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| isCanon | boolean | Yes | Whether entity is part of official canon |
| canonVersion | int | No | Canon revision number |
| canonApprovedBy | string | No | Author who approved canon status |
| canonApprovedAt | datetime | No | When canon status was granted |
| supersededBy | string | No | Newer entity that replaces this |
| canonNotes | string | No | Notes on canon decision |

---

## 8. AI Metadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| source | string | No | Origin: manual, ai-generated, ai-assisted |
| confidence | float | No | AI confidence score (0.0-1.0) |
| embedding | float[] | No | Vector embedding (for search) |
| embeddingModel | string | No | Model used for embedding |
| lastIndexed | datetime | No | Last index timestamp |
| aiSummary | string | No | AI-generated summary |
| suggestedEdits | string[] | No | AI-suggested improvements |

---

## 9. Compliance & Access Metadata

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| locale | string | No | Language code (en, fr, etc.) |
| license | string | No | Content license |
| owner | string | No | Content owner |
| sensitivity | enum | No | Public, Internal, Confidential |
| maturityRating | enum | No | Everyone, Teen, Mature, Explicit |
| contentWarnings | string[] | No | CW tags |
| accessLevel | enum | No | Read, Write, Admin |
