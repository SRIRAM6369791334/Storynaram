# Schema Registry & Governance Diagrams

## 1. Complete Schema Ecosystem

```mermaid
graph TB
    subgraph "Schema Framework (118 schemas)"
        CORE[Core - 23<br/>BaseEntity Foundation]
        DOMAIN[Domain - 35<br/>Narrative Entities]
        AI[AI - 20<br/>Runtime Intelligence]
        WF[Workflow - 20<br/>Process Automation]
        VAL[Validation - 20<br/>Quality Assurance]

        CORE -->|allOf $ref| DOMAIN
        CORE -->|BaseAI| AI
        CORE -->|BaseWorkflow| WF
        CORE -->|BaseValidation| VAL
        WF --> VAL
        AI --> VAL
    end

    subgraph "Governance Layer (new)"
        REG[Registry - 14 files]
        GOV[Governance - 9 docs]
        COMPAT[Compatibility - 5 docs]
        MIG[Migration - 4 docs]
        REL[Releases - 4 files]
        DISC[Discovery - 6 indexes]
        REP[Reports - 5 docs]
    end

    REG -->|catalogs| CORE
    REG -->|catalogs| DOMAIN
    REG -->|catalogs| AI
    REG -->|catalogs| WF
    REG -->|catalogs| VAL
    GOV -->|governs| REG
    COMPAT -->|validates| REG
    MIG -->|documents| REG
    REL -->|packages| REG
    DISC -->|indexes| REG
    REP -->|reports on| REG

    style CORE fill:#1a1a2e,stroke:#e94560,color:#fff
    style DOMAIN fill:#16213e,stroke:#0f3460,color:#fff
    style AI fill:#0f3460,stroke:#16213e,color:#fff
    style WF fill:#533483,stroke:#e94560,color:#fff
    style VAL fill:#1a1a2e,stroke:#0f3460,color:#fff
```

## 2. Registry Relationships

```mermaid
graph TD
    SR[schema-registry.json<br/>Root] --> CR[core-registry.json]
    SR --> DR[domain-registry.json]
    SR --> AR[ai-registry.json]
    SR --> WR[workflow-registry.json]
    SR --> VR[validation-registry.json]

    SR --> VER[version-registry.json]
    SR --> DEP[dependency-registry.json]
    SR --> REF[reference-registry.json]

    CR --> COMP[composition-registry.json]
    DR --> COMP
    AR --> COMP

    VR --> VALIDX[validation-registry-index.json]
    PL[plugin-registry.json] --> INT[integration-registry.json]
    INT --> RT[runtime-registry.json]

    style SR fill:#e94560,color:#fff
    style CR,DR,AR,WR,VR fill:#16213e,stroke:#0f3460,color:#fff
```

## 3. Dependency Graph

```mermaid
graph LR
    subgraph "Layer 0: Core"
        BASEID[BaseIdentifier]
        BASEMD[BaseMetadata]
        BASEAUD[BaseAudit]
        BASEENT[BaseEntity]
        BASEAI[BaseAI]
        BASEWF[BaseWorkflow]
        BASEVAL[BaseValidation]
    end

    subgraph "Layer 1: Domain"
        CHAR[Character]
        BOOK[Book]
        WORLD[World]
        ITEM[Item]
        ORG[Organization]
        QUEST[Quest]
        TL[Timeline]
        LOC[Location]
        MAGIC[Magic]
        more[...35 total]
    end

    subgraph "Layer 2: Workflow"
        ROOTWF[Workflow]
        WFSTATE[WorkflowState]
        WFTRANS[WorkflowTransition]
        WFAPPROV[WorkflowApproval]
        WFMETRICS[WorkflowMetrics]
        WFCONFIG[WorkflowConfiguration]
        more2[...20 total]
    end

    BASEID --> BASEENT
    BASEMD --> BASEENT
    BASEAUD --> BASEENT
    BASEENT --> CHAR
    BASEENT --> BOOK
    BASEENT --> WORLD
    BASEENT --> ITEM
    BASEENT --> ORG
    BASEENT --> QUEST
    BASEENT --> TL
    BASEENT --> LOC
    BASEENT --> MAGIC

    WFSTATE --> ROOTWF
    WFTRANS --> ROOTWF
    WFAPPROV --> ROOTWF
    WFMETRICS --> ROOTWF
    WFCONFIG --> ROOTWF
```

## 4. Governance Workflow

```mermaid
flowchart TD
    RFC[RFC Submitted] --> IMPACT{Impact Analysis}
    IMPACT -->|Non-Breaking| FAST[Fast Track]
    IMPACT -->|Breaking| FULL[Full Review]

    FAST --> APPROVE[Schema Owner Approves]
    FULL --> PEER[Peer Review]
    PEER --> ARCH[Architecture Review]
    ARCH --> SEC[Security Review]
    SEC --> BOARD[Architecture Board]
    BOARD --> APPROVE

    APPROVE --> IMPL[Implementation]
    IMPL --> TEST[Validation + Tests]
    TEST --> DOC[Documentation Update]
    DOC --> REG[Registry Update]
    REG --> COMPAT[Compatibility Check]
    COMPAT --> RELEASE[Release]

    RELEASE --> NOTIFY{Notify Consumers}
    NOTIFY -->|Breaking| MAIL[30-day Notice]
    NOTIFY -->|Non-Breaking| CHANGELOG[Changelog Entry]

    style APPROVE fill:#16213e,stroke:#0f3460,color:#fff
    style RELEASE fill:#1a1a2e,stroke:#e94560,color:#fff
```

## 5. Schema Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Create
    Draft --> Experimental: Alpha Release
    Experimental --> Stable: GA Release
    Stable --> Deprecated: Mark Deprecated
    Deprecated --> Archived: Remove from Active Use
    Draft --> Archived: Rejected
    
    state Draft {
        [*] --> proposed
        proposed --> in_review
        in_review --> approved
    }
    
    state Stable {
        [*] --> active
        active --> maintenance
    }
    
    state Deprecated {
        [*] --> announced
        announced --> sunset
    }
```

## 6. Release Pipeline

```mermaid
flowchart LR
    DEV[Development] --> FREEZE[Code Freeze]
    FREEZE --> ALPHA[Alpha Release]
    ALPHA --> BETA[Beta Release]
    BETA --> RC[Release Candidate]
    RC --> GA[General Availability]
    GA --> LTS[LTS Release]
    
    ALPHA -->|Issues Found| DEV
    BETA -->|Issues Found| DEV
    RC -->|Issues Found| DEV
    
    LTS --> EOL[End of Life]
    EOL --> ARCHIVE[Archived]
```

## 7. Migration Flow

```mermaid
flowchart TD
    START[Decide to Migrate] --> ASSESS{Assess Impact}
    ASSESS -->|Breaking| MAJOR[MAJOR Version Required]
    ASSESS -->|Additive| MINOR[MINOR Version Sufficient]

    MAJOR --> PLAN[Migration Plan]
    MINOR --> DRYRUN[Dry Run]

    PLAN --> DRYRUN
    DRYRUN -->|Pass| EXECUTE[Execute Migration]
    DRYRUN -->|Fail| PLAN

    EXECUTE --> VALIDATE{Validate}
    VALIDATE -->|Pass| COMPLETE[Migration Complete]
    VALIDATE -->|Fail| ROLLBACK[Rollback]
    ROLLBACK --> PLAN

    COMPLETE --> REGUPDATE[Update Registry]
    REGUPDATE --> DOCUPDATE[Update Documentation]
    DOCUPDATE --> NOTIFY[Notify Consumers]
```

## 8. Discovery Flow

```mermaid
flowchart LR
    QUERY[Schema Query] --> INDEX{Check Index}
    INDEX -->|Category| SCHEMA_INDEX[SCHEMA_INDEX.md]
    INDEX -->|Entity| ENTITY_INDEX[ENTITY_INDEX.md]
    INDEX -->|AI| AI_INDEX[AI_INDEX.md]
    INDEX -->|Workflow| WF_INDEX[WORKFLOW_INDEX.md]
    INDEX -->|Validation| VAL_INDEX[VALIDATION_INDEX.md]
    INDEX -->|Reference| REF_INDEX[REFERENCE_INDEX.md]

    SCHEMA_INDEX --> REGISTRY{Check Registry}
    ENTITY_INDEX --> REGISTRY
    AI_INDEX --> REGISTRY
    WF_INDEX --> REGISTRY
    VAL_INDEX --> REGISTRY
    REF_INDEX --> REGISTRY

    REGISTRY -->|category| CAT_REG[Category Registry]
    REGISTRY -->|version| VER_REG[Version Registry]
    REGISTRY -->|deps| DEP_REG[Dependency Registry]

    CAT_REG --> SCHEMA[Schema File]
    VER_REG --> SCHEMA
    DEP_REG --> SCHEMA

    SCHEMA --> DEPS[Resolved Dependencies]
    SCHEMA --> CONSUMERS[Consumer List]

    style REGISTRY fill:#1a1a2e,stroke:#e94560,color:#fff
    style SCHEMA fill:#16213e,stroke:#0f3460,color:#fff
```
