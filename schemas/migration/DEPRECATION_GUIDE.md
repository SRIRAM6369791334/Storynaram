# Deprecation Guide

## Deprecation Lifecycle

```
Announce → Deprecate → Remove
   |            |           |
   v            v           v
  Month 0     Month 3     Month 6+
```

- **Announce**: Public notice of upcoming deprecation
- **Deprecate**: Schema marked as deprecated; continues to function
- **Remove**: Schema deleted or replaced (minimum 3 months after deprecation)

Minimum period between each phase: **3 months**.

## Deprecation Notice

When deprecating a schema or property:

1. **Schema Description**: Add `deprecated: true` and a `deprecationMessage` to the schema
   ```json
   {
     "deprecated": true,
     "deprecationMessage": "Use NewSchema instead. Deprecated since v2.0.0. Removal target: v3.0.0."
   }
   ```

2. **Registry**: Update the registry entry with deprecation status and replacement path
3. **Changelog**: Document the deprecation in the changelog under the `### Deprecated` section

## Consumer Notification

When a schema is deprecated, notify consumers via:
- **Email**: Schema maintainers mailing list
- **Slack**: #schema-notifications channel
- **In-App**: Dashboard banner for registry UI
- **Release Notes**: Highlighted in release notes

## Migration Path

Every deprecated schema MUST provide:
- Replacement schema name and location
- Migration guide detailing how to transition
- Automated migration script (if feasible)
- Timeline for removal

## Removal Criteria

A schema may be removed only when:
- [ ] No active consumers remaining (confirmed via usage tracking)
- [ ] Migration to replacement is complete for all consumers
- [ ] Archive period has expired (minimum 6 months from deprecation)
- [ ] Archive backup created before deletion
