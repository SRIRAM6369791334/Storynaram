# Prompts Directory

## Purpose
The AI Prompt Architecture. Defines how prompts are structured, assembled, versioned, and optimized for AI interactions.

## Responsibility
Manages the prompt lifecycle â€” template design, variable injection, context assembly, model-specific optimization, versioning, and performance tracking.

## Prompt Structure
Every prompt follows this structure:
`	ext
[SYSTEM] System instructions and role definition
[CONTEXT] Knowledge context relevant to the task
[EXAMPLES] Few-shot examples if applicable
[TASK] The specific task to perform
[CONSTRAINTS] Output format and content constraints
[INPUT] User/AI input data
`

## Prompt Types
| Type | Purpose |
|------|---------|
| Generation | Create new content |
| Modification | Modify existing content |
| Analysis | Analyze content |
| Validation | Validate content |
| Suggestion | Generate suggestions |
| Question | Answer questions |
| Planning | Plan tasks |

## Input
- Task specification
- Knowledge context
- Model identifier

## Output
- Assembled prompt string
- Token count estimate
- Prompt metadata

## Dependencies
- context/ â€” provides context for prompt assembly
- pipeline/ â€” prompt assembly is a pipeline stage
- sessions/ â€” prompt history tracking
