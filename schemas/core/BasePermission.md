# BasePermission

**File:** `BasePermission.schema.json`

**Purpose:** Access control and permission block — role-based, attribute-based, and entity-level permissions with inheritance and restrictions.

**Referenced Template:** `templates/base/BasePermission.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** Owner defaults: read/write/delete/share all true. Group defaults: read=true, write=false, delete=false. World defaults: read=true, write=false. `restrictions[].type` enum: `time`, `location`, `ip`, `condition`, `attribute`. Inheritance defaults to true.

**Validation Notes:** Permissions follow a hierarchical model: owner > group > world. Restrictions can be time-, location-, or condition-based.

**Backward Compatibility:** Adding new restriction types is additive. All sections are optional.
