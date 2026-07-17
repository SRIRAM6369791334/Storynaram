# IntegrationProfile

**File:** `IntegrationProfile.schema.json`

**Purpose:** Defines validation requirements for external integrations including endpoints, auth, and data mapping.

**Type:** Standalone Validation Schema

**Template Source:** `templates/validation/IntegrationProfile.template.json`

**Required Properties:** `integrationName`, `endpoint`, `authType`

**Key Enums:** `authType` (oauth2, apikey, basic, jwt, none), `protocol` (rest, graphql, grpc, webhook)

**Validation Scope:** security / cross-entity

**Cross-References:** PluginValidation, ExtensionValidation, SecurityValidation
