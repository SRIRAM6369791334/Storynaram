# BaseComment

**File:** `BaseComment.schema.json`

**Purpose:** Comment and annotation system — threaded comments, inline field annotations, and formal review records.

**Referenced Template:** `templates/base/BaseComment.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `comments[].parentId` enables threading. `resolved` defaults to false. `annotations[].type` enum: `suggestion`, `question`, `issue`, `note`. `reviews[].decision` enum: `approved`, `rejected`, `changes-requested`, `pending`. All timestamps use `date-time` format.

**Validation Notes:** Comments support nested threading via parentId. Annotations target specific fields with character offsets. Reviews track formal approval decisions.

**Backward Compatibility:** Adding new annotation/review decision types is additive. All sections are optional.
