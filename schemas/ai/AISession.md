# AISession

**File:** `AISession.schema.json`

**Purpose:** AI session lifecycle management with model assignments, token usage, context accumulation, and persistence.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AISession.template.json`

**Required Properties:** none

**Key Enums:** status (initializing, active, idle, paused, expiring, expired, terminated, error)

**Validation Notes:** dates use date-time format; tokenUsage tracks input, output, and cached tokens.

**Runtime Role:** Manages end-to-end session state, token accounting, and context accumulation across requests.

**Cross-References:** AIContext, AITokenBudget, AIConversation, AIConfiguration
