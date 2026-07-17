# WorkflowValidation

**File:** `WorkflowValidation.template.json`

**Purpose:** Validates workflow state machine correctness, transition coverage, deadlock freedom, guard completeness, and reachable state analysis.

**Inputs:** `workflowId`, `stateMachineCheck`, `transitionCoverage`, `deadlockDetection`, `unreachableStates`, `missingTransitions`, `guardCompleteness`

**Outputs:** Workflow validation results identifying state machine issues and missing transitions.

**Dependencies:** `Workflow` and `WorkflowConfiguration` templates; `ValidationProfile` for orchestration; `WorkflowCondition` for guard evaluation.

**Validation Rules:** Validates all states are reachable; detects deadlock states; ensures transitions exist for all state combinations; verifies guards are defined for conditional transitions.

**Future Extensions:** Visual state machine diffing for workflow version comparisons.
