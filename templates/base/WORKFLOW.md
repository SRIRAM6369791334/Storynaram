# BaseWorkflow

## Purpose
Defines workflow and automation for entity operations. Supports multi-stage workflows, assignments, and event-driven automation rules.

## Required Fields
None (all optional)

## Optional Fields
- `workflows` — workflow definitions with stages and triggers
- `assignments` — active task/assignment records
- `automation` — event-driven automation rule engine

## Inheritance Rules
- **Final**: none
- **Overrideable**: `workflows`, `assignments`, `automation`
