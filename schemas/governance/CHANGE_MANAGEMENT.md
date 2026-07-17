# Change Management Process

All schema changes follow a standardized change management process. The process applies to new schemas, existing schema updates, lifecycle transitions, and deprecations.

## Process Flow

```
1. RFC Submission
       ↓
2. Impact Analysis
       ↓
3. Review Board Approval
       ↓
4. Schema Update
       ↓
5. Registry Update
       ↓
6. Migration Path Documentation
       ↓
7. Compatibility Matrix Update
       ↓
8. Release Note Generation
       ↓
9. Consumer Notification
```

## Step Details

### 1. RFC Submission

The Schema Steward submits a Schema Change Proposal (RFC) containing:

- Schema name and `$id`
- Current version and proposed new version
- Nature of change (new schema, MAJOR, MINOR, PATCH, deprecation, archival)
- Detailed description of changes
- Motivation and rationale
- Impact summary (proposed)
- Migration approach (if breaking)

RFC template is maintained at `schemas/governance/templates/RFC_TEMPLATE.md`.

### 2. Impact Analysis

The Schema Steward (with automated tooling) performs:

- **Breaking vs. non-breaking classification** — verified against the rules in VERSION_POLICY.md
- **Consumer identification** — using the dependency registry to find all schemas and systems that reference this schema
- **Change scope** — number of schemas affected, number of consumers affected
- **Risk assessment** — low / medium / high based on change type and consumer impact

Results are appended to the RFC.

### 3. Review Board Approval

- **Peer review** — at least one Schema Steward from a different category
- **Architecture review** — Schema Owner or designate assesses cross-schema impact
- **Security review** — data classification and access pattern review (if applicable)
- **Final approval** — Review Board votes: approve, reject, or request changes

Approval criteria:
- All quality gates passed (see QUALITY_GATES.md)
- Impact analysis complete
- Migration path documented (for breaking changes)
- All review comments resolved

### 4. Schema Update

The Schema Steward implements the approved changes:

- Updates the schema file
- Updates version number
- Updates `$comment` or `x-storynaram` metadata
- Adds or updates examples
- Updates README if applicable

### 5. Registry Update

Update the appropriate category registry file:

- Bump version entry
- Update lifecycle status
- Update compatibility information
- Add or update dependency entries

### 6. Migration Path Documentation

For breaking changes (MAJOR), document:

- Schema differences between old and new versions
- Automated migration script or manual migration steps
- Validation procedure to confirm successful migration
- Rollback procedure

### 7. Compatibility Matrix Update

Update `COMPATIBILITY_MATRIX.md` to reflect:

- New version compatibility with other categories
- Any breaking changes to compatibility boundaries
- Migration matrix for multi-version jumps

### 8. Release Note Generation

The Release Manager generates release notes including:

- Schema name and version
- Change type (MAJOR / MINOR / PATCH)
- Summary of changes
- Migration instructions (if applicable)
- Deprecation notices (if applicable)
- Contributors

### 9. Consumer Notification

The Release Manager notifies all identified consumers:

- Email or ticket to team owners
- Update to consumer-tracking registry
- Scheduled deprecation timeline (if applicable)

## Emergency Changes

Emergency changes (security vulnerabilities, critical bugs) bypass steps 1–3 but require:

- Post-hoc Review Board notification within 24 hours
- Full review within 7 days
- Retroactive RFC submission

## Change Types and Required Steps

| Change Type | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|-------------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| New schema (draft) | ✓ | — | — | ✓ | ✓ | — | — | — | — |
| New schema (experimental) | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | — |
| MAJOR | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| MINOR | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| PATCH | ✓ | — | — | ✓ | ✓ | — | — | ✓ | — |
| Deprecation | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| Archival | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ |
