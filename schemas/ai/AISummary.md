# AISummary

**File:** `AISummary.schema.json`

**Purpose:** Summary configuration and generated summary entries for AI content.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AISummary.template.json`

**Required Properties:** none

**Key Enums:** strategy (extractive, abstractive, hybrid)

**Validation Notes:** maxLength constrained between 50 and 4096; summary tokens recorded per entry.

**Runtime Role:** Controls automatic summarization of content and stores versioned summary entries with model attribution.

**Cross-References:** AIConversation, AISession, AITokenBudget
