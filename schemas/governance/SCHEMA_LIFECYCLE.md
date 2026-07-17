# Schema Lifecycle

Each Storynaram schema progresses through a defined set of states. Transitions between states require explicit approval from the Review Board.

## State Machine

```
               +---> experimental ---+
               |                      |
draft ---------+                      +---> stable ---> deprecated ---> archived
                                       ↑
                              (direct promotion
                               for well-understood
                               schemas)
```

## State Definitions

### draft

| Aspect | Detail |
|--------|--------|
| **Stability** | None. Schema may change without notice. |
| **Change Policy** | Any change allowed. No version tracking required. |
| **Migration** | Not required. No consumers should depend on draft schemas. |
| **Support Duration** | Indefinite, but schemas should not linger in draft. |
| **Required Documentation** | Minimal: `title`, `description`, valid JSON Schema structure. |

Entry criteria: Initial creation by Schema Owner or Steward.

### experimental

| Aspect | Detail |
|--------|--------|
| **Stability** | Low. Breaking changes allowed but must be announced. |
| **Change Policy** | MAJOR bumps permitted without migration path. MINOR and PATCH follow standard rules. |
| **Migration** | Documented but optional. Consumers advised to pin to specific versions. |
| **Support Duration** | Up to 6 months. If not promoted to `stable`, schema returns to `draft` or is archived. |
| **Required Documentation** | Full schema metadata, basic README, at least one test example. |

Entry criteria:
- Schema passes QG-1 through QG-5.
- Schema Owner approves transition.
- Registry entry created with `experimental` status.

### stable

| Aspect | Detail |
|--------|--------|
| **Stability** | High. Backward compatible within MAJOR version. |
| **Change Policy** | MAJOR bumps require a deprecation cycle. MINOR and PATCH follow standard rules. |
| **Migration** | Migration path required for any breaking change (next MAJOR). |
| **Support Duration** | Minimum 12 months before deprecation. |
| **Required Documentation** | Full schema metadata, README, test examples, cross-schema impact assessment, consumer list. |

Entry criteria:
- Schema passes QG-1 through QG-8.
- Peer review, architecture review, and security review completed.
- Review Board approves.
- Registry entry updated to `stable`.
- Compatibility matrix updated.

### deprecated

| Aspect | Detail |
|--------|--------|
| **Stability** | Still functional. No new features added. |
| **Change Policy** | Critical bug fixes only. No MINOR or MAJOR changes. |
| **Migration** | Migration path to replacement schema must exist and be documented. |
| **Support Duration** | 6 months from deprecation announcement. |
| **Required Documentation** | Deprecation notice in schema file, registry, and release notes. Migration guide published. |

Entry criteria:
- Replacement schema is `stable`.
- All consumers notified.
- Deprecation announced in release notes.
- Review Board approves.

### archived

| Aspect | Detail |
|--------|--------|
| **Stability** | Read-only. Schema preserved for historical reference. |
| **Change Policy** | No changes permitted. |
| **Migration** | All consumers must have migrated off. |
| **Support Duration** | Permanent (historical record). |
| **Required Documentation** | Archived status in registry. Pointer to replacement schema. |

Entry criteria:
- Deprecation period ended.
- No active consumers detected.
- Schema Owner and Review Board approve.
- Registry entry updated to `archived`.

## State Transition Requirements

| Transition | Review Required | Board Approval | Registry Update | Consumer Notification |
|------------|:---------------:|:--------------:|:---------------:|:--------------------:|
| draft → experimental | Yes (peer) | No | Yes | No |
| draft → stable | Yes (full) | Yes | Yes | No |
| experimental → stable | Yes (full) | Yes | Yes | Yes |
| stable → deprecated | Yes (board) | Yes | Yes | Yes |
| deprecated → archived | No | Yes | Yes | Yes |
| stable → archived (emergency) | No | Yes (emergency) | Yes | Yes |

## Duration Limits

| State | Maximum Duration | Extension |
|-------|----------------:|-----------|
| draft | 3 months | Board approval for up to 3 additional months |
| experimental | 6 months | Board approval for up to 6 additional months |
| stable | Indefinite | N/A |
| deprecated | 6 months | Board approval for up to 3 additional months |
| archived | Permanent | N/A |
