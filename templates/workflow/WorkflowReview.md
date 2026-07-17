# WorkflowReview

**File:** `WorkflowReview.template.json`

**Purpose:** Review process definition — peer, editorial, technical, and AI review workflows with scoring, weighted criteria, and decision collection.

**Inputs:** `type` (peer/editorial/technical/ai), `reviewers[]`, `criteria[]` (name, description, weight, required), `comments[]`, `scoring` (scale, passThreshold, aggregateMethod), `deadline`.

**Outputs:** `decisions[]` — approved / changes-requested / rejected / abstained with score per reviewer.

**Dependencies:** WorkflowState (requiresReview states), WorkflowAssignment (reviewer routing), WorkflowNotification (review invitations, reminders).

**Relationships:** WorkflowApproval (reviews may feed into approval), WorkflowAction (post-review actions), WorkflowNotification (reviewer notifications).

**Lifecycle:** Open → In-Review → Decision (approved/changes-requested/rejected). Expired if deadline passes.

**Future Extensions:** Add AI-assisted review summaries and automated review quality scoring.
