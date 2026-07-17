# SecurityValidation

**File:** `SecurityValidation.schema.json`

**Purpose:** Validates security constraints such as authentication, authorization, and input sanitization.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/SecurityValidation.template.json`

**Required Properties:** `securityLevel`, `checks`

**Key Enums:** `securityLevel` (none, basic, strict, paranoid), `checkType` (authz, sanitize, rateLimit, audit)

**Validation Scope:** security

**Cross-References:** PermissionValidation, AIValidationProfile
