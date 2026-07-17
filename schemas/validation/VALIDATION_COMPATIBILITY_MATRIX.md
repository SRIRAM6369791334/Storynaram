# Validation Compatibility Matrix

## Cross-Schema Validation Support

| Schema | Core v1.0 | Domain v1.0 | AI v1.0 | Workflow v1.0 | Validation v1.0 |
|--------|:---------:|:-----------:|:-------:|:--------------:|:----------------:|
| ValidationRule | ✓ | ✓ | ✓ | ✓ | ✓ |
| ValidationProfile | ✓ | ✓ | ✓ | ✓ | ✓ |
| ValidationResult | ✓ | ✓ | ✓ | ✓ | ✓ |
| ValidationError | ✓ | ✓ | ✓ | ✓ | ✓ |
| ValidationWarning | ✓ | ✓ | ✓ | ✓ | ✓ |
| ValidationConstraint | ✓ | ✓ | ✓ | ✓ | ✓ |
| BusinessRule | ✓ | ✓ | ✓ | ✓ | ✓ |
| ReferenceIntegrity | ✓ | ✓ | ✓ | - | ✓ |
| RelationshipIntegrity | ✓ | ✓ | - | - | ✓ |
| CanonIntegrity | ✓ | ✓ | ✓ | - | ✓ |
| WorkflowValidation | - | - | - | ✓ | ✓ |
| AIValidationProfile | - | ✓ | ✓ | - | ✓ |
| SecurityValidation | ✓ | - | - | - | ✓ |
| PermissionValidation | ✓ | ✓ | - | - | ✓ |
| VersionValidation | ✓ | ✓ | ✓ | ✓ | ✓ |
| MigrationValidation | ✓ | ✓ | ✓ | ✓ | ✓ |
| CompatibilityValidation | ✓ | ✓ | ✓ | ✓ | ✓ |
| ExtensionValidation | ✓ | ✓ | ✓ | ✓ | ✓ |
| PluginValidation | - | - | ✓ | ✓ | ✓ |
| IntegrationProfile | ✓ | ✓ | ✓ | ✓ | ✓ |

## Validator Compatibility

| Validator | Draft 2020-12 | $ref Resolution | Format Assertion |
|-----------|:---:|:---:|:---:|
| Ajv 8.x | ✓ | ✓ | ✓ |
| Hyperjump 1.x | ✓ | ✓ | ~ |
| Everitt 1.x | ✓ | ✓ | ~ |

## Schema Version Compatibility

| Validation Schema | Validator | Min Runtime |
|-------------------|-----------|-------------|
| v1.0.x | Draft 2020-12 | v2.0.0 |
| v1.1.x | Draft 2020-12 | v2.1.0 |
| v2.0.x | Draft 2020-12 | v3.0.0 |
