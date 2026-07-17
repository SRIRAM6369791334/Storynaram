# AI Directory

## Purpose
The central AI Knowledge Architecture for Storynaram. This directory contains the complete infrastructure for AI-assisted story creation â€” knowledge management, retrieval, context building, memory, reasoning, validation, and agent orchestration.

## Responsibility
Provides the AI Brain of Storynaram. Every AI operation â€” reading, writing, suggesting, validating, reasoning â€” is governed by the architecture defined here. This is not an implementation directory; it is the architectural blueprint for all AI interactions.

## Architecture Overview
`
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      AI Platform                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚Knowledge â”‚ Retrievalâ”‚ Context  â”‚ Memory   â”‚ Reasoning       â”‚
â”‚ Graph    â”‚ Pipeline â”‚ Builder  â”‚ System   â”‚ Engine          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Search   â”‚ Ranking  â”‚ Cache    â”‚Embeddingsâ”‚ Canon           â”‚
â”‚ Engine   â”‚ Algorithmâ”‚ Layer    â”‚ Store    â”‚ Engine          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Agents   â”‚Workflows â”‚ Prompts  â”‚Pipeline  â”‚ Validation      â”‚
â”‚ Registry â”‚ Engine   â”‚ Library  â”‚Orchestr. â”‚ Pipeline        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Sessions â”‚ Logging  â”‚Monitor   â”‚Security  â”‚ Analytics       â”‚
â”‚ Manager  â”‚ System   â”‚ Dashboardâ”‚ Layer    â”‚ Engine          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
`

## Directory Structure
| Directory | Purpose |
|-----------|---------|
| knowledge/ | Knowledge base, index, graph, store, registry, lifecycle |
| graph/ | Knowledge graph traversal and relationship models |
| etrieval/ | Retrieval pipeline â€” keyword, semantic, hybrid, graph |
| context/ | Context builder â€” prioritization, window optimization |
| memory/ | Memory system â€” short-term, long-term, working memory |
| canon/ | Canon engine â€” conflict detection, locking, approval |
| easoning/ | Reasoning engine â€” planning, consistency, fact verification |
| search/ | Search engine â€” indexes, ranking, filtering |
| anking/ | Ranking algorithms â€” relevance, priority, recency |
| cache/ | Cache layer â€” context, knowledge, embeddings, prompts |
| embeddings/ | Embedding architecture â€” chunking, vectors, similarity |
| pipeline/ | AI pipeline orchestration â€” request to response |
| planner/ | Planning engine â€” task decomposition, strategy |
| gents/ | Agent definitions â€” roles, responsibilities, behaviors |
| workflows/ | Workflow definitions â€” multi-step AI processes |
| alidation/ | Validation pipeline â€” input, reference, canon, output |
| suggestions/ | Suggestion engine â€” generation, ranking, presentation |
| prompts/ | Prompt library â€” templates, assembly, versioning |
| sessions/ | Session management â€” state, history, continuity |
| logging/ | AI logging â€” operations, decisions, performance |
| monitoring/ | Monitoring â€” metrics, dashboards, alerts |
| nalytics/ | Analytics â€” usage patterns, quality, effectiveness |
| security/ | Security â€” permissions, audit, data protection |

## Relationships
- **core/** AI standards (AI_STANDARD.md) govern all AI behavior
- **config/ai_rules.json** provides runtime AI configuration
- **memory/** (root) stores runtime AI memory data
- **prompts/** (root) stores prompt template files
- **All domain directories** are knowledge sources for the AI
