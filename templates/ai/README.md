# AI Template Framework

## Purpose

Reusable AI templates that every Storynaram entity uses for AI interaction. Covers context building, memory, retrieval, embeddings, prompt assembly, canon verification, reasoning, summarization, validation, and multi-model compatibility.

## Templates

| # | Template | Purpose |
|---|----------|---------|
| 1 | [AIContext](AIContext.template.json) | Context assembly — entity, story, world, timeline, scene, conversation, memory, session, plugin |
| 2 | [AIMemory](AIMemory.template.json) | 8 memory types — short-term, long-term, canon, character, world, conversation, working, archived |
| 3 | [AIRetrieval](AIRetrieval.template.json) | 8 retrieval strategies — keyword, semantic, hybrid, graph, timeline, relationship, canon, memory |
| 4 | [AIEmbedding](AIEmbedding.template.json) | Embedding metadata — model, dimensions, chunk strategy, refresh policy, vector references |
| 5 | [AIPrompt](AIPrompt.template.json) | Prompt assembly — system, developer, user prompts with context/memory/canon injection |
| 6 | [AISummary](AISummary.template.json) | Auto-summarization — extractive, abstractive, hybrid strategies |
| 7 | [AICanon](AICanon.template.json) | Canon verification — strict/lenient/suggestive modes, conflict detection |
| 8 | [AIReasoning](AIReasoning.template.json) | Reasoning engine — CoT, ToT, ReAct, Reflexion, Plan-and-Execute |
| 9 | [AIValidation](AIValidation.template.json) | AI output validation — canon compliance, constraints, format, factual accuracy, hallucination detection |
| 10 | [AISearch](AISearch.template.json) | Multi-strategy search — keyword, semantic, hybrid, graph |
| 11 | [AIRanking](AIRanking.template.json) | Multi-factor ranking — relevance, importance, recency, audience |
| 12 | [AIReference](AIReference.template.json) | AI cross-references — entity, relationship, memory, canon, source |
| 13 | [AITokenBudget](AITokenBudget.template.json) | Token budget — priority, chunking, compression, overflow |
| 14 | [AIConversation](AIConversation.template.json) | Conversation tracking — turns, participants, topics, sentiment |
| 15 | [AISession](AISession.template.json) | Session management — lifecycle, models, token tracking |
| 16 | [AIWorkflow](AIWorkflow.template.json) | Workflow orchestration — stages, model routing, fallback |
| 17 | [AIPlanner](AIPlanner.template.json) | AI planning — goal decomposition, plan steps, adaptation |
| 18 | [AITask](AITask.template.json) | Task definition — type, I/O, models, timeout, retry |
| 19 | [AIAnalytics](AIAnalytics.template.json) | Analytics — token usage, latency, costs, errors |
| 20 | [AIConfiguration](AIConfiguration.template.json) | Root config — models, parameters, features, limits |

## Pipeline

```mermaid
graph LR
    ES[Entity Selection] --> CC[Context Collection]
    CC --> MR[Memory Retrieval]
    MR --> CV[Canon Verification]
    CV --> RE[Relationship Expansion]
    RE --> PA[Prompt Assembly]
    PA --> RZ[Reasoning]
    RZ --> VL[Validation]
    VL --> RG[Response Generation]
    RG --> MU[Memory Update]

    style ES fill:#1a1a2e,stroke:#e94560,color:#fff
    style RG fill:#16213e,stroke:#0f3460,color:#fff
```

## Multi-Model Support

All templates are model-agnostic. Compatibility: GPT, Claude, Gemini, Llama, Mistral, DeepSeek, future models.
