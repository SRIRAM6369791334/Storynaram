# Workflow Architecture Diagrams

## 1. Generic Workflow Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Planning : Submit
    Planning --> Writing : Approve Plan
    Writing --> Review : Submit for Review
    Review --> Approved : Approve
    Review --> Writing : Revisions Requested
    Approved --> Published : Publish
    Published --> Archived : Archive
    Archived --> Published : Restore
    Published --> Deprecated : Deprecate
    Draft --> Deleted : Discard
    Planning --> Deleted : Cancel
    Writing --> Deleted : Cancel

    state Review {
        [*] --> Pending
        Pending --> InReview
        InReview --> Approved
        InReview --> ChangesRequested
        ChangesRequested --> InReview
    }
```

## 2. Approval Flow

```mermaid
graph TB
    START[Start] --> SUBMIT[Submit for Approval]
    SUBMIT --> AI_CHECK{AI Check}
    AI_CHECK -->|Pass| AUTO_ROUTE{Auto-route}
    AI_CHECK -->|Fail| REJECT[Rejected]

    AUTO_ROUTE -->|Low Risk| AUTO_APPROVE[Auto-Approve]
    AUTO_ROUTE -->|Medium Risk| SINGLE[Single Approver]
    AUTO_ROUTE -->|High Risk| PARALLEL[Parallel Review]
    AUTO_ROUTE -->|Critical| SEQUENTIAL[Sequential Review]

    SINGLE --> DECIDE{Decide}
    PARALLEL --> DECIDE
    SEQUENTIAL --> DECIDE

    DECIDE -->|Approve| APPROVED[Approved]
    DECIDE -->|Reject| REJECT
    DECIDE -->|Changes| CHANGES[Changes Requested]

    CHANGES --> SUBMIT
    APPROVED --> END[End]

    style APPROVED fill:#16213e,stroke:#0f3460,color:#fff
    style REJECT fill:#1a1a2e,stroke:#e94560,color:#fff
```

## 3. AI Content Generation Workflow

```mermaid
graph TB
    START[Request] --> PLAN[AI Planning]
    PLAN --> CONTEXT[Context Collection]
    CONTEXT --> MEMORY[Memory Retrieval]
    MEMORY --> CANON[Canon Verification]
    CANON --> PROMPT[Prompt Assembly]
    PROMPT --> GENERATE[AI Generation]
    GENERATE --> VERIFY[AI Verification]
    VERIFY --> QUALITY{Quality Check}
    QUALITY -->|Pass| APPROVE[Auto-Approve]
    QUALITY -->|Flag| HUMAN[Human Review]
    QUALITY -->|Fail| REGENERATE[Regenerate]
    HUMAN --> DECIDE{Human Decision}
    DECIDE -->|Approve| APPROVE
    DECIDE -->|Reject| REJECT
    DECIDE -->|Revise| REVISE[AI Revision]
    REVISE --> VERIFY
    REGENERATE --> PROMPT
    APPROVE --> PUBLISH[Publish]
    REJECT --> END[End]

    style APPROVE fill:#16213e,stroke:#0f3460,color:#fff
    style REJECT fill:#1a1a2e,stroke:#e94560,color:#fff
```

## 4. Publishing Workflow

```mermaid
graph TB
    DRAFT[Draft Complete] --> PREFLIGHT[Preflight Check]
    PREFLIGHT --> FORMAT[Formatting]
    FORMAT --> PROOF{Proofread}
    PROOF -->|Pass| APPROVAL[Approval Gate]
    PROOF -->|Issues| REVISE[Revise]
    REVISE --> FORMAT

    APPROVAL --> APPROVE{Approved?}
    APPROVE -->|Yes| PUBLISH[Publish]
    APPROVE -->|No| REJECT[Reject]
    APPROVE -->|Changes| REVISE

    PUBLISH --> NOTIFY[Notifications]
    NOTIFY --> ARCHIVE[Archive Source]
    ARCHIVE --> COMPLETE[Complete]

    style PUBLISH fill:#16213e,stroke:#0f3460,color:#fff
    style COMPLETE fill:#1a1a2e,stroke:#e94560,color:#fff
```

## 5. Import / Export Workflow

```mermaid
graph LR
    subgraph "Import Pipeline"
        UPLOAD[Upload] --> VALIDATE[Validate]
        VALIDATE --> MAP[Field Mapping]
        MAP --> TRANSFORM[Transform]
        TRANSFORM --> IMPORT[Import]
        IMPORT --> VERIFY_IMP[Verify]
        VERIFY_IMP --> COMPLETE_IMP[Complete]
    end

    subgraph "Export Pipeline"
        SELECT[Select] --> EXTRACT[Extract]
        EXTRACT --> TRANSFORM_EXP[Transform]
        TRANSFORM_EXP --> PACKAGE[Package]
        PACKAGE --> DELIVER[Deliver]
        DELIVER --> CONFIRM[Confirm]
    end

    style COMPLETE_IMP fill:#16213e,stroke:#0f3460,color:#fff
    style CONFIRM fill:#16213e,stroke:#0f3460,color:#fff
```

## 6. Entity Type State Machines

```mermaid
graph TB
    subgraph "Character Lifecycle"
        CD[Draft] --> CP[Planning]
        CP --> CW[Writing]
        CW --> CR[Review]
        CR --> CA[Approved]
        CA --> CPUB[Published]
        CPUB --> CARCH[Archived]
    end

    subgraph "Book Lifecycle"
        BO[Outline] --> BD[Drafting]
        BD --> BE[Editing]
        BE --> BR[Review]
        BR --> BA[Approved]
        BA --> BPUB[Published]
    end

    subgraph "Scene Lifecycle"
        SO[Outlined] --> SW[Written]
        SW --> SR[Revised]
        SR --> SREV[Reviewed]
        SREV --> SL[Locked]
    end

    subgraph "Canon Review"
        CN[Submitted] --> CAI[AI Check]
        CAI --> CHR[Human Review]
        CHR --> CNA[Approved]
        CNA --> CNZ[Canonized]
    end
```
