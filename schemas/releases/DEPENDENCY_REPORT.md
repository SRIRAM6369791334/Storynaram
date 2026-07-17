# Dependency Report

**Date**: 2026-07-17

## Summary

| Metric                        | Value  |
|-------------------------------|--------|
| Total dependency relationships| 57     |
| Circular dependencies         | 0      |
| Max dependency chain depth    | 2      |
| Most depended-upon schema     | BaseEntity (35 dependents) |

## Dependency Breakdown

### allOf Dependencies (38)

**Core → Core** (3)
BaseEntity depends on:
- BaseIdentifier
- BaseMetadata
- BaseAudit

**Domain → Core** (35)
All 35 domain entity schemas depend on BaseEntity via `allOf`:
- Ability, Armor, Artifact, Book, Canon, Chapter, Character, City, Country, Culture, Dialogue, Document, Family, Item, Kingdom, Language, Location, Magic, Map, Memory, Mission, Organization, Quest, Race, Religion, Rule, Scene, Species, Spell, Technology, Timeline, TimelineEvent, Vehicle, Weapon, World

### $ref Dependencies (19)

**Workflow → Workflow** (19)
Workflow.schema.json references 19 workflow sub-schemas:
- WorkflowState, WorkflowTransition, WorkflowTrigger, WorkflowCondition, WorkflowAction, WorkflowApproval, WorkflowReview, WorkflowAssignment, WorkflowNotification, WorkflowEvent, WorkflowQueue, WorkflowSchedule, WorkflowTimer, WorkflowCheckpoint, WorkflowRollback, WorkflowRetry, WorkflowAudit, WorkflowMetrics, WorkflowConfiguration

## Dependency Categories

| Category               | Count |
|------------------------|-------|
| allOf (inheritance)    | 38    |
| $ref (reference)       | 19    |
| **Total**              | **57**|

## Chain Depth

```
Core (BaseEntity) ──> Domain (35 schemas)    [depth 1 → depth 2]
Core (BaseIdentifier, BaseMetadata, BaseAudit) ──> BaseEntity  [depth 1]
```

Maximum depth: **2** (domain → core)
