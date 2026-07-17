# Workflow Schema Diagrams

## 1. Workflow Schema Hierarchy

```mermaid
graph TB
    WF[Workflow.schema.json] --> State[WorkflowState]
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

    style WF fill:#1a1a2e,stroke:#e94560,color:#fff
    style State,Trans,Trig fill:#16213e,stroke:#0f3460,color:#fff
    style Action,Approval,Review fill:#16213e,stroke:#0f3460,color:#fff
    style Audit,Metrics,Config fill:#16213e,stroke:#0f3460,color:#fff
```

## 2. Workflow State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft: Create
    Draft --> Planning: Start Planning
    Planning --> Writing: Start Writing
    Writing --> Review: Submit for Review
    Review --> Approved: Approve
    Review --> Writing: Request Changes
    Approved --> Published: Publish
    Published --> Archived: Archive
    Published --> Deprecated: Deprecate
    Archived --> Deleted: Delete
    Deprecated --> Deleted: Delete
    
    Draft --> Deleted: Cancel
    Planning --> Deleted: Cancel
    Writing --> Deleted: Cancel
    Review --> Deleted: Cancel
    
    state Draft {
        [*] --> initial
    }
    
    state Review {
        [*] --> pending
        pending --> in_review
        in_review --> approved
        in_review --> changes_requested
    }
```

## 3. Workflow Transition Graph

```mermaid
graph LR
    D[Draft] -->|start_planning| P[Planning]
    D -->|cancel| DEL[Deleted]
    P -->|start_writing| W[Writing]
    P -->|cancel| DEL
    W -->|submit_review| R[Review]
    W -->|cancel| DEL
    R -->|approve| A[Approved]
    R -->|request_changes| W
    R -->|cancel| DEL
    A -->|publish| PUB[Published]
    PUB -->|archive| ARC[Archived]
    PUB -->|deprecate| DEP[Deprecated]
    ARC -->|delete| DEL
    DEP -->|delete| DEL

    style D fill:#e94560,color:#fff
    style A fill:#0f3460,color:#fff
    style PUB fill:#16213e,color:#fff
    style DEL fill:#533483,color:#fff
```

## 4. Approval Flow

```mermaid
flowchart TB
    START[Approval Requested] --> TYPE{Approval Type}
    
    TYPE -->|Single| SINGLE[Single Approver]
    TYPE -->|Sequential| SEQ[Stage 1 → Stage 2 → Stage N]
    TYPE -->|Parallel| PAR[All Approvers Simultaneous]
    TYPE -->|Multi-Stage| MULTI[Stage Gate 1 → Gate 2]
    TYPE -->|AI| AI[AI Validates]
    TYPE -->|Hybrid| HYBRID[AI + Human Combined]

    SINGLE -->|Approve| PASS
    SINGLE -->|Reject| FAIL

    SEQ -->|All Approve| PASS
    SEQ -->|Any Reject| FAIL

    PAR -->|Voting Threshold| PASS
    PAR -->|Threshold Not Met| FAIL

    AI -->|Passes| PASS
    AI -->|Fails| FAIL

    HYBRID -->|AI Suggests + Human Decides| PASS
    HYBRID -->|Human Overrides| FAIL

    PASS --> RESULT[Approved]
    FAIL --> RESULT2[Rejected]

    style PASS fill:#16213e,stroke:#0f3460,color:#fff
    style FAIL fill:#1a1a2e,stroke:#e94560,color:#fff
```

## 5. Workflow Dependency Graph

```mermaid
graph TD
    subgraph "Definition"
        WFD[Workflow Definition]
        SD[State Definitions]
        TD[Transition Rules]
    end

    subgraph "Execution Dependencies"
        SM[State Machine Engine]
        AE[Action Executor]
        APE[Approval Engine]
        RE[Review Engine]
        QE[Queue Engine]
        SE[Scheduler]
        TE[Timer Engine]
    end

    subgraph "Persistence"
        CP[Checkpoint Manager]
        RB[Rollback Handler]
        AR[Audit Recorder]
    end

    subgraph "Observability"
        MC[Metrics Collector]
        NC[Notification Dispatcher]
    end

    WFD --> SM
    SD --> SM
    TD --> SM
    SM --> AE
    SM --> APE
    SM --> RE
    SM --> QE
    SE --> SM
    TE --> SM
    AE --> CP
    CP --> RB
    AE --> AR
    APE --> AR
    RE --> NC
    APE --> NC
    AE --> MC
    AR --> MC
```

## 6. Validation Pipeline

```mermaid
flowchart LR
    DOC[Workflow Document] --> L1{Layer 1: Structural}
    L1 -->|JSON Schema| L1PASS
    L1 -->|$ref Resolution| L1PASS
    
    L1PASS --> L2{Layer 2: Cross-Schema}
    L2 -->|State References| L2PASS
    L2 -->|Approver References| L2PASS
    L2 -->|Trigger Consistency| L2PASS
    
    L2PASS --> L3{Layer 3: State Machine}
    L3 -->|Initial State| L3PASS
    L3 -->|Reachability| L3PASS
    L3 -->|Terminal Check| L3PASS
    L3 -->|Error Coverage| L3PASS
    
    L3PASS --> FINAL{Final}
    FINAL -->|Valid| VALID[✓ VALID]
    FINAL -->|Invalid| INVALID[✗ INVALID]

    style VALID fill:#16213e,stroke:#0f3460,color:#fff
    style INVALID fill:#1a1a2e,stroke:#e94560,color:#fff
```
