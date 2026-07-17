# Workflows

## Purpose
Defines the multi-step, multi-agent workflows for complex story creation tasks.

---

## 1. Workflow Engine

```mermaid
graph TD
    subgraph "Workflow Engine"
        WE[Workflow Executor]
        WS[Workflow Scheduler]
        WT[Workflow Tracker]
        WL[Workflow Logger]
    end

    subgraph "Workflow Definitions"
        W1[Create New Book]
        W2[Create Chapter]
        W3[Write Scene]
        W4[Update Character]
        W5[Review Story]
        W6[Validate Canon]
    end

    WE --> W1
    WE --> W2
    WE --> W3
    WE --> W4
    WE --> W5
    WE --> W6
    WS --> WE
    WT --> WE
    WL --> WE
```

---

## 2. Workflow: Create New Book

```mermaid
graph TD
    A[Start: Create Book] --> B[Define Book Metadata]
    B --> C[Create Book Outline]
    C --> D[Identify Main Characters]
    D --> E[Identify Key Locations]
    E --> F[Draft Timeline]
    F --> G[Validate Structure]
    G --> H{Valid?}
    H -->|Yes| I[Create Book Entity]
    H -->|No| C
    I --> J[Assign Chapters]
    J --> K[Complete]
```

**Steps:**
1. Define title, series, genre, word count target
2. Create chapter-by-chapter outline
3. List protagonist, antagonist, major supporting characters
4. Define primary setting and key locations
5. Map major timeline events
6. Validate narrative structure completeness
7. Create book entity JSON
8. Create empty chapter scaffolds

**Duration:** Full workflow
**Agents:** Outline Planner, Character Builder, World Builder, Timeline Builder
---

## 3. Workflow: Create Chapter

```mermaid
graph TD
    A[Start: Create Chapter] --> B[Load Book Context]
    B --> C[Define Chapter Purpose]
    C --> D[Plan Scene Sequence]
    D --> E[Assign POV Characters]
    E --> F[Create Chapter Outline]
    F --> G[Validate Chapter Structure]
    G --> H{Valid?}
    H -->|Yes| I[Create Chapter Entity]
    H -->|No| D
    I --> J[Create Scene Scaffolds]
    J --> K[Complete]
```

---

## 4. Workflow: Write Scene

```mermaid
graph TD
    A[Start: Write Scene] --> B[Load Scene Context]
    B --> C[Load Character States]
    C --> D[Load Location Details]
    D --> E[Review Previous Scene]
    E --> F[Write Scene Content]
    F --> G[Validate Scene Goals]
    G --> H{Goals Met?}
    H -->|Yes| I[Fact Check]
    H -->|No| F
    I --> J[Check Canon Consistency]
    J --> K{Passed?}
    K -->|Yes| L[Format Scene]
    K -->|No| M[Flag Issues]
    M --> F
    L --> N[Update Character States]
    N --> O[Complete]
```

**Steps:**
1. Load chapter context, previous scene
2. Load POV character current state
3. Load location description and properties
4. Review previous scene for continuity
5. Write scene following scene contract
6. Validate scene goals are accomplished
7. Verify facts against knowledge base
8. Check canon consistency
9. Format scene per MARKDOWN_STANDARD
10. Update character location/knowledge states

**Agents:** Scene Writer, Fact Checker, Canon Checker, Metadata Generator
---

## 5. Workflow: Update Character

```mermaid
graph TD
    A[Start: Update Character] --> B[Load Character]
    B --> C[Identify Changes]
    C --> D[Apply Modifications]
    D --> E[Update Relationships]
    E --> F[Validate Schema]
    F --> G{Valid?}
    G -->|No| D
    G -->|Yes| H[Check Canon Consistency]
    H --> I{Consistent?}
    I -->|Yes| J[Update Character Entity]
    I -->|No| K[Flag Conflicts]
    K --> L[Resolve Conflicts]
    L --> H
    J --> M[Update Related Entities]
    M --> N[Update Memory]
    N --> O[Complete]
```

---

## 6. Workflow: Review Story

```mermaid
graph TD
    A[Start: Review] --> B[Load Content]
    B --> C[Fact Check]
    C --> D[Canon Check]
    D --> E[Continuity Check]
    E --> F[Style Check]
    F --> G[Quality Assessment]
    G --> H[Generate Report]
    H --> I[Suggest Improvements]
    I --> J[Complete]
```

---

## 7. Workflow: Validate Canon

```mermaid
graph TD
    A[Start: Canon Validation] --> B[Collect All Entities]
    B --> C[Load Canon Records]
    C --> D[Cross-Reference All Data]
    D --> E[Detect Conflicts]
    E --> F{Conflicts Found?}
    F -->|Yes| G[Generate Conflict Report]
    F -->|No| H[Generate Clean Report]
    G --> I[Flag for Human Review]
    H --> J[Update Canon Registry]
    I --> K[Complete]
    J --> K
```

---

## 8. Workflow Execution Model

| Property | Value |
|----------|-------|
| Execution | Sequential or parallel steps |
| Validation Gates | After each step |
| Error Handling | Retry, skip, or abort |
| Rollback | Reverse completed steps |
| Logging | Every step is logged |

### Step Structure
```json
{
  "stepId": "wf_000001_step_001",
  "name": "Load Book Context",
  "agent": "Outline Planner",
  "input": { "bookId": "book_000001" },
  "output": { "bookContext": "..." },
  "validationGate": {
    "rules": ["context_loaded", "book_exists"]
  },
  "handling": {
    "onError": "retry",
    "maxRetries": 3
  }
}
```
