# VersionValidation

**File:** `VersionValidation.template.json`

**Purpose:** Validates template versions, schema compatibility, migration paths, deprecation status, and breaking changes.

**Inputs:** `templateId`, `currentVersion`, `schemaVersion`, `compatibilityRange`, `migrationPath`, `deprecationCheck`, `breakingChanges`

**Outputs:** Version validation results indicating upgrade safety and deprecated components.

**Dependencies:** Entity or workflow template being validated; `MigrationValidation` for migration path verification; `CompatibilityValidation` for compatibility analysis.

**Validation Rules:** Validates semantic versioning format (X.Y.Z); checks current version is within compatibility range; verifies migration paths are ordered and complete; flags deprecated templates; documents breaking changes.

**Future Extensions:** Automated version bump suggestions based on schema diff analysis.
