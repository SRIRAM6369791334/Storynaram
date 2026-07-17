# AIConfiguration

**File:** `AIConfiguration.schema.json`

**Purpose:** Central AI runtime configuration covering default model, inference parameters, feature toggles, rate limits, logging, and model registry.

**Type:** Standalone AI Runtime Schema

**Template Source:** `templates/ai/AIConfiguration.template.json`

**Required Properties:** none

**Key Enums:** logging level (debug, info, warn, error, none); runtime environment (development, staging, production)

**Validation Notes:** temperature 0-2; topP 0-1; frequencyPenalty and presencePenalty -2 to 2; maxTokens positive integer.

**Runtime Role:** Bootstrap configuration loaded at startup to define the AI runtime's model registry, inference defaults, rate limits, and feature flags.

**Cross-References:** AISession, AITask, AIWorkflow, AIAnalytics
