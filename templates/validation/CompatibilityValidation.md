# CompatibilityValidation

**File:** `CompatibilityValidation.template.json`

**Purpose:** Assesses forward and backward compatibility between versions with breaking change analysis and migration recommendations.

**Inputs:** `sourceVersion`, `targetVersion`, `forwardCompatible`, `backwardCompatible`, `breakingChanges`, `migrationRequired`, `recommendedAction`

**Outputs:** Compatibility assessment with recommended action (upgrade, downgrade, defer, or manual review).

**Dependencies:** `VersionValidation` for version information; `MigrationValidation` for migration paths; entity templates for schema comparison.

**Validation Rules:** Validates both forward and backward compatibility flags; identifies breaking changes between versions; determines if migration is required; generates recommended action based on compatibility analysis.

**Future Extensions:** Automated compatibility scoring with weighted breaking change penalties.
