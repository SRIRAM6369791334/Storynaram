# Workflows Directory

## Purpose
The Workflow Engine Architecture. Defines multi-step, multi-agent workflows for complex story creation tasks.

## Responsibility
Orchestrates end-to-end workflows that involve multiple AI agents and steps. Workflows define the sequence, dependencies, handoffs, and validation gates for complex operations.

## Defined Workflows
| Workflow | Steps |
|----------|-------|
| Create New Book | Plan â†’ Outline â†’ Characters â†’ World â†’ Chapters |
| Create Chapter | Plan â†’ Outline â†’ Scenes â†’ Write â†’ Review â†’ Revise |
| Write Scene | Context â†’ Plan â†’ Write â†’ Validate â†’ Revise |
| Update Character | Load â†’ Modify â†’ Validate â†’ Relationships â†’ Canon Check |
| Update Timeline | Load â†’ Modify â†’ Validate â†’ Cross-reference â†’ Canon Check |
| Review Story | Load â†’ Read â†’ Analyze â†’ Report â†’ Suggest |
| Generate Suggestions | Context â†’ Analyze â†’ Ideate â†’ Rank â†’ Present |
| Validate Canon | Collect â†’ Cross-reference â†’ Detect Conflicts â†’ Report |
| Export Manuscript | Collect â†’ Format â†’ Validate â†’ Export â†’ Log |

## Workflow Structure
`mermaid
graph TD
    A[Start] --> B[Step 1: Plan]
    B --> C{Validation Gate}
    C -->|Pass| D[Step 2: Execute]
    C -->|Fail| B
    D --> E{Validation Gate}
    E -->|Pass| F[Step 3: Review]
    E -->|Fail| D
    F --> G{Approval Gate}
    G -->|Approve| H[Complete]
    G -->|Reject| F
`

## Input
- Workflow trigger (user request or system event)
- Initial context

## Output
- Workflow completion result
- Step-by-step execution log
- Validation results at each gate

## Dependencies
- agents/ â€” executes workflow steps
- planner/ â€” plans workflow execution
- pipeline/ â€” pipeline stages align with workflow steps
