# Workflow Reference Model

## Schema Composition

```mermaid
graph TB
    WF[Workflow] --> State[WorkflowState]
    WF --> Trans[WorkflowTransition]
    WF --> Trig[WorkflowTrigger]
    WF --> Cond[WorkflowCondition]
    WF --> Action[WorkflowAction]
    WF --> Approval[WorkflowApproval]
    WF --> Review[WorkflowReview]
    WF --> Assign[WorkflowAssignment]
    WF --> Notif[WorkflowNotification]
    WF --> Event[WorkflowEvent]
    WF --> CP[WorkflowCheckpoint]
    WF --> RB[WorkflowRollback]
    WF --> Retry[WorkflowRetry]
    WF --> Sched[WorkflowSchedule]
    WF --> Timer[WorkflowTimer]
    WF --> Queue[WorkflowQueue]
    WF --> Audit[WorkflowAudit]
    WF --> Metrics[WorkflowMetrics]
    WF --> Config[WorkflowConfiguration]

    State --> Trans
    Trans --> Trig
    Trans --> Cond
    Action --> Approval
    Action --> Review
    Action --> Assign
    Action --> Notif
    Trig --> Sched
    Trig --> Timer
    CP --> RB
    Retry --> Queue
    Audit --> Metrics
    Config --> Retry
    Config --> Queue

    style WF fill:#1a1a2e,stroke:#e94560,color:#fff
```

## Data Flow

```mermaid
flowchart LR
    subgraph "Definition"
        WFDEF[Workflow Definition]
        STATES[State Definitions]
        TRANS[Transition Rules]
    end

    subgraph "Execution"
        ENGINE[Workflow Engine]
        STATE_MACHINE[State Machine]
        APPROVAL[Approval Engine]
        QUEUE[Queue Manager]
        SCHED[Schedule Engine]
    end

    subgraph "Observability"
        AUDIT[Audit Trail]
        METRICS[Metrics Collector]
    end

    WFDEF --> ENGINE
    STATES --> STATE_MACHINE
    TRANS --> STATE_MACHINE
    ENGINE --> STATE_MACHINE
    STATE_MACHINE --> APPROVAL
    STATE_MACHINE --> QUEUE
    SCHED --> ENGINE
    ENGINE --> AUDIT
    ENGINE --> METRICS
```

## Core-to-Workflow Mapping

| Core Schema | Workflow Schema | Relationship |
|-------------|----------------|-------------|
| BaseEntity.workflow | Workflow | Entity-level workflow assignments |
| BaseLifecycle | WorkflowState, WorkflowTransition | Entity lifecycle as workflow |
| BaseStatus | WorkflowState.status | Status enum alignment |
| BaseWorkflow.workflows[] | Workflow | Core defines per-entity workflow list |
| BaseWorkflow.assignments[] | WorkflowAssignment | Core tracks active assignments |
