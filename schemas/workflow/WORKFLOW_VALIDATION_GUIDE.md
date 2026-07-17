# Workflow Validation Guide

## Validation Layers

### Layer 1: Structural Schema Validation

Enforces Draft 2020-12 compliance:
- All `$ref` targets resolve
- No circular `$ref` chains
- Enum values are valid
- Numeric bounds respected
- Required fields present

### Layer 2: Cross-Schema Validation

Runtime validation:
- Transition `from`/`to` values reference defined states
- Trigger `type` is consistent with trigger-specific fields (cron for time-based)
- Approval stage approvers reference defined approvers
- Checkpoint IDs referenced by rollback exist
- Queue priority levels are unique
- Schedule constraints valid for constraint type

### Layer 3: State Machine Validation

- Exactly one initial state
- No orphan states (unreachable from initial)
- Terminal states have no outgoing transitions
- Error states accessible from all non-terminal states
- No deadlocks in transition graph

## Validation Flow

```mermaid
flowchart TD
    DOC[Workflow Document] --> S1{Structural}
    S1 --> S2{Cross-Schema}
    S2 --> S3{State Machine}
    
    S1 -->|$ref| REF[Resolve Refs]
    S1 -->|enum| ENUM[Validate Enums]
    S1 -->|bounds| BOUNDS[Validate Ranges]
    
    S2 -->|transitions| TREF[State References]
    S2 -->|triggers| TCONS[Trigger Consistency]
    S2 -->|approvals| APREF[Approver References]
    
    S3 -->|initial| INITIAL[One Initial State]
    S3 -->|reachability| REACH[All States Reachable]
    S3 -->|terminal| TERM[Terminal Has No Transitions]
    S3 -->|errors| ERR[Error From Any Non-Terminal]
    
    ALL{All Passed?} -->|Yes| VALID[✓ VALID]
    ALL -->|No| INVALID[✗ INVALID]

    style VALID fill:#16213e,stroke:#0f3460,color:#fff
    style INVALID fill:#1a1a2e,stroke:#e94560,color:#fff
```

## Common Failures

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| Transition from 'x' to 'y' but 'x' undefined | State name mismatch | Match state.name exactly |
| No initial state defined | initialState missing | Set initialState to a valid state name |
| Terminal state has outgoing transitions | Terminal defined as intermediate | Set state type to terminal or add no transitions |
| Trigger type 'cron' but no cron field | Wrong trigger type | Add cron or change trigger type |
| Approval requiredCount > approvers | Too high requirement | Reduce requiredCount or add approvers |
