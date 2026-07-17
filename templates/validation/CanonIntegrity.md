# CanonIntegrity

**File:** `CanonIntegrity.template.json`

**Purpose:** Validates internal consistency across a canon's entities and rules, detecting contradictions and ensuring narrative coherence.

**Inputs:** `canonId`, `entityIds`, `ruleIds`, `consistencyCheck`, `contradictionDetection`, `importanceThreshold`, `lastVerified`

**Outputs:** Canon integrity report with consistency score, contradictions found, and last verification timestamp.

**Dependencies:** `Canon` entity template; `BusinessRule` templates governing canon logic; entity templates for all referenced entities.

**Validation Rules:** Detects contradictions between entity attributes and canon rules; enforces importance threshold filtering; validates all referenced entities and rules exist.

**Future Extensions:** Timeline-aware canon validation that flags anachronisms and temporal paradoxes.
