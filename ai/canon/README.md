# Canon Directory

## Purpose
The Canon Engine Architecture. Defines how canonical truth is maintained, validated, and protected.

## Responsibility
Enforces canonical consistency across the entire story universe. The Canon Engine detects contradictions, validates relationships, ensures timeline coherence, and manages the canon lifecycle from draft through finalization.

## Core Capabilities
| Capability | Description |
|------------|-------------|
| Conflict Detection | Identifies contradictory entity states |
| Contradiction Resolution | Suggests resolutions for conflicts |
| Relationship Validation | Ensures relationship integrity |
| Timeline Validation | Verifies chronological consistency |
| Age Validation | Ensures character age consistency |
| Location Validation | Verifies spatial consistency |
| Story Rule Validation | Checks against writing rules |
| Canon Lock | Prevents changes to finalized canon |
| Canon Approval | Workflow for canon finalization |
| Canon Update | Controlled update process |

## Canon States
`
draft â†’ review â†’ approved â†’ locked
  â†‘        â†“          â†“
  â””â”€â”€ rejected â”€â”€â”€â”€â”€â”€â”˜
`

## Input
- Entity data from all domains
- Relationship definitions
- Timeline data
- Writing rules from config

## Output
- Canon validation results
- Conflict reports
- Canon status changes

## Dependencies
- core/standards/ â€” validation rules
- core/contracts/ â€” entity contracts
- graph/ â€” relationship graph for validation
- reasoning/ â€” logical reasoning for conflict detection
