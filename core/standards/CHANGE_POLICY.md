# Change Policy

## Purpose
Defines the change management policy for Storynaram â€” how changes are proposed, reviewed, approved, documented, and deployed.

## Change Types

### Type 1: Patch
- Bug fixes, typo corrections, formatting fixes
- No structural changes
- No field additions or removals
- Approval: Self-approved or single reviewer
- Documentation: Updated entity version, optional changelog entry

### Type 2: Minor
- New optional fields
- New entity types
- New tags
- New optional relationships
- Approval: Single reviewer
- Documentation: Updated entity version, changelog entry at MINOR level

### Type 3: Major
- New required fields
- Field type changes
- Relationship model changes
- New standards
- Existing standard amendments
- Approval: Project owner or designated approver
- Documentation: Full changelog, migration guide if breaking

### Type 4: Architectural
- Directory structure changes
- Core contract changes
- Standard deprecations
- Breaking data model changes
- Approval: Project owner
- Documentation: Full architectural decision record (ADR), migration plan

## Change Workflow
`	ext
1. PROPOSE â€” Describe the change, rationale, impact
2. REVIEW â€” Assess impact, check compatibility
3. APPROVE â€” Get required approval based on change type
4. IMPLEMENT â€” Make the change
5. DOCUMENT â€” Update version, changelog, relevant docs
6. VALIDATE â€” Run validators
7. COMMIT â€” Commit to version control
`

## Change Documentation
Every change must include:
- **What** changed
- **Why** it changed
- **When** it changed
- **Who** changed it
- **Impact** on existing data
- **Migration path** if breaking

## Deprecation Policy
1. Mark entity/field/standard as deprecated in metadata
2. Document the deprecation in the relevant contract/standard
3. Announce deprecation explicitly
4. Maintain backward compatibility for 2 MAJOR versions
5. After deprecation period, archive the affected entities

## Version Bump Rules
| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Patch | PATCH +1 | 1.0.0 â†’ 1.0.1 |
| Minor | MINOR +1, PATCH = 0 | 1.0.0 â†’ 1.1.0 |
| Major | MAJOR +1, MINOR = 0, PATCH = 0 | 1.0.0 â†’ 2.0.0 |
| Architectural | MAJOR +1+ | 1.0.0 â†’ 2.0.0 (or higher) |

## Emergency Changes
- Emergency patches (critical bug fixes) may skip the review step
- Documentation must catch up within 24 hours
- Emergency status is recorded in the change record
- Post-emergency review is mandatory

## Change Review Checklist
- [ ] Change type identified (Patch/Minor/Major/Architectural)
- [ ] Impact assessment completed
- [ ] Backward compatibility considered
- [ ] Migration path documented (if breaking)
- [ ] Validators updated (if schema changed)
- [ ] Contracts updated (if entity structure changed)
- [ ] Standards updated (if rules changed)
- [ ] Changelog updated
- [ ] Version bumped
