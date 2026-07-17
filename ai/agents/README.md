# Agents Directory

## Purpose
The AI Agents Architecture. Defines the roles, responsibilities, and behaviors of specialized AI agents.

## Responsibility
Defines a modular agent system where each agent has a specific responsibility â€” world building, character creation, scene writing, editing, review, validation, and more. Agents can operate independently or collaborate on complex tasks.

## Agent Definitions

### Story Agents
| Agent | Responsibility |
|-------|---------------|
| World Builder | Creates and maintains world entities |
| Character Builder | Creates and maintains character entities |
| Timeline Builder | Manages timeline and events |
| Outline Planner | Plans story outlines and structure |

### Writing Agents
| Agent | Responsibility |
|-------|---------------|
| Chapter Writer | Writes chapter content |
| Scene Writer | Writes scene content |
| Dialogue Writer | Writes character dialogue |
| Editor | Edits and refines content |

### Quality Agents
| Agent | Responsibility |
|-------|---------------|
| Reviewer | Reviews content quality |
| Fact Checker | Verifies factual accuracy |
| Canon Checker | Validates canon consistency |
| Relationship Validator | Validates relationship integrity |
| Continuity Checker | Ensures narrative continuity |
| Style Checker | Validates writing style consistency |

### Support Agents
| Agent | Responsibility |
|-------|---------------|
| Suggestion Engine | Generates suggestions |
| Prompt Builder | Builds AI prompts |
| Metadata Generator | Generates entity metadata |
| Search Specialist | Handles complex searches |

## Agent Behavior
Each agent follows: Receive Task â†’ Gather Context â†’ Execute â†’ Validate â†’ Return Result

## Input
- Task assignment from planner/workflow
- Relevant context and knowledge

## Output
- Completed task result
- Validation status
- Agent log

## Dependencies
- planner/ â€” assigns tasks to agents
- workflows/ â€” orchestrates multi-agent workflows
- knowledge/ â€” agents access knowledge
