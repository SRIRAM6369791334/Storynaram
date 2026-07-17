# AIConversation

**File:** `AIConversation.schema.json`

**Purpose:** Conversation tracking with turn management, participants, topics, sentiment, and summarization.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIConversation.template.json`

**Required Properties:** none

**Key Enums:** participant type (user, ai, character, system); state (active, paused, archived, completed, expired)

**Validation Notes:** sentiment ranges -1 to 1; turn number sequential; topics track start/end turns.

**Runtime Role:** Maintains conversation state, tracks turn-by-turn dialogue, and computes sentiment trends per participant.

**Cross-References:** AIContext, AISession, AIMemory, AISummary
