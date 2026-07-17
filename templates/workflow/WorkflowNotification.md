# WorkflowNotification

**File:** `WorkflowNotification.template.json`

**Purpose:** Multi-channel notification delivery — email, Slack, in-app, and webhook with configurable templates, recipients, event triggers, and throttling.

**Inputs:** `channels[]`, `templates` (email/slack/in-app/webhook with channel-specific schema), `recipients[]` (id, type: user/group/role/external, channel), `triggers[]` (event, channel, template, conditions), `throttling` (maxPerMinute, maxPerHour, cooldownPeriod, aggregation).

**Outputs:** Delivered notification via configured channel(s); throttled if rate limits exceeded.

**Dependencies:** WorkflowAction (notification actions), WorkflowEvent (triggering events), WorkflowApproval (escalation/rejection notifications), WorkflowAssignment (deadline reminders).

**Relationships:** WorkflowApproval (escalation alerts), WorkflowReview (review invitations), WorkflowAssignment (assignment notifications), WorkflowRollback (rollback alerts).

**Lifecycle:** Triggered → Queued → Sent / Throttled. Aggregated mode batches similar notifications.

**Future Extensions:** Add push notification channel and SMS delivery support.
