# Planner Directory

## Purpose
The Planning Engine Architecture. Defines how complex AI tasks are decomposed into actionable plans.

## Responsibility
Decomposes high-level requests into step-by-step plans. The planner decides what needs to happen, in what order, and what knowledge/resources are needed at each step.

## Planning Strategies
| Strategy | Use Case |
|----------|----------|
| Linear | Simple sequential tasks |
| Hierarchical | Complex tasks with sub-tasks |
| Iterative | Tasks requiring refinement |
| Conditional | Tasks with branching paths |
| Parallel | Tasks that can run concurrently |

## Input
- High-level task description
- Available knowledge context
- Resource constraints

## Output
- Step-by-step plan
- Dependency graph
- Resource requirements

## Dependencies
- agents/ â€” assigns steps to agents
- workflows/ â€” executes planned workflows
- reasoning/ â€” planning requires reasoning
