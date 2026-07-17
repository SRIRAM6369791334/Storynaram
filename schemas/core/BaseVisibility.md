# BaseVisibility

**File:** `BaseVisibility.schema.json`

**Purpose:** Visibility and publication control — determines who can see an entity and in what contexts, with embargo and audience targeting.

**Referenced Template:** `templates/base/BaseVisibility.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** `visibility`

**Key Constraints:** `visibility` enum: `public`, `private`, `restricted`, `internal`, `hidden`, `draft`. `published` boolean defaults to false. `embargo.releaseDate` uses `date-time` format. `audience` and `accessGroups` are string arrays.

**Validation Notes:** When `published` is false the entity is not publicly accessible regardless of visibility level. Embargo supports conditional release.

**Backward Compatibility:** Adding new visible enum values is additive. Removing values is breaking.
