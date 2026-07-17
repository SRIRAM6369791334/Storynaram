# AI Template Framework — Best Practices

## Context Management

- **Limit context sources** — Only include context sources relevant to the current task. Excess context increases token usage and dilutes focus.
- **Priority rank all contexts** — Assign contextPriority (0-100) to every context source. Critical context = 80-100, nice-to-have = 10-30.
- **Summarize aggressively** — Use AISummary to compress historical context. A 1000-token summary beats 10000 tokens of raw history.
- **Context window budgeting** — Allocate no more than 60% of the context window to accumulated context. Reserve 40% for reasoning and response.

## Memory Architecture

- **Prefer long-term over short-term** — Consolidate short-term to long-term frequently. Short-term memory decays faster.
- **Importance scoring** — Score every memory 0-100. Memories below 10 can be auto-archived. Memories above 90 should be canon-verified.
- **Decay strategically** — Set decay rates based on entity type. Character memories decay slower than scene memories.
- **Character memory isolation** — Never mix memory pools between characters. Each character's memory is a separate partition.

## Retrieval Strategy

- **Hybrid first** — Always prefer hybrid retrieval (keyword + semantic) over single-strategy. Default weights: 0.4 keyword, 0.6 semantic.
- **Canon retrieval** — Always enable canon retrieval for narrative consistency queries. Set strict mode for published works, lenient for drafts.
- **Graph traversal depth** — Limit to 2 hops for most queries. 3+ hops only for deep world-building queries.
- **Result limits** — Cap retrieval results at 10 items. More than 10 creates noise.

## Prompt Design

- **System prompt first** — Define AI persona and behavior in the system prompt. Keep it under 500 tokens.
- **Context after instructions** — Inject context after system/developer prompts but before user request.
- **Canon as constraints** — Frame canon rules as "must" and "must not" constraints. Place them after context.
- **Examples for complex tasks** — Use 1-3 few-shot examples for structured output tasks. More examples increase token usage with diminishing returns.

## Canon Management

- **Strict mode for published** — Published books and public canon use strict mode.
- **Lenient for drafts** — Drafts and works-in-progress use lenient mode to avoid blocking creativity.
- **Importance threshold** — Set conflict detection threshold at 0.8. Below 0.8 = warning, above 0.8 = violation.
- **Audit violations** — Log all canon violations for human review. Pattern of violations indicates canon rule needs clarification.

## Validation

- **Always validate canon compliance** — Never skip canon validation for AI responses that modify narrative.
- **Hallucination detection** — Enable for all AI-generated content. Use embedding-distance method with threshold 0.85.
- **Format validation** — Always specify expected output format. Validate that the output matches.

## Performance

- **Cache embeddings** — Cache embedding vectors in the entity document. Regenerate on update only.
- **Batch memory consolidation** — Don't consolidate after every memory write. Batch every 10 writes or 5 minutes.
- **Pre-compute summaries** — Generate summaries on entity update, not on every retrieval.
- **Token budget monitoring** — Log token usage per session. Alert if any entity type consistently exceeds 80% of budget.
