# AI Template Framework — Runtime Checklist

## Pre-Flight Checks

- [ ] AI Configuration template loaded
- [ ] Default model selected (model-agnostic fallback configured)
- [ ] Token budget allocated per entity type
- [ ] Embedding model configured and verified
- [ ] Vector database connection available
- [ ] Memory storage backend initialized
- [ ] Canon rule registry populated
- [ ] Plugin sandbox configured (if plugins enabled)

## Per-Request Checks

- [ ] Entity document loaded and parsed
- [ ] AIContext assembled from available sources
- [ ] Context priority ranking applied
- [ ] Token budget checked (request fits)
- [ ] Memory retrieved (short-term + long-term)
- [ ] Memory items ranked by importance + recency
- [ ] Canon rules loaded for entity type
- [ ] Canon verification mode set
- [ ] Relationship expansion configured (hops limit)
- [ ] Prompt template selected
- [ ] Context injected into prompt
- [ ] Memory injected into prompt
- [ ] Canon injected as constraints
- [ ] Examples included (if applicable)
- [ ] Output format constraints set
- [ ] Reasoning mode selected
- [ ] Validation stages configured
- [ ] Hallucination detection enabled
- [ ] Overflow strategy defined

## Post-Request Checks

- [ ] Output validated against canon
- [ ] Output validated against constraints
- [ ] Output format verified
- [ ] Memory updated with new information
- [ ] Short-term memory stored
- [ ] Consolidation trigger checked
- [ ] Token usage logged
- [ ] Latency metrics recorded
- [ ] Errors logged and categorized
- [ ] Cost tracked (if applicable)

## Emergency Checks

- [ ] Model fallback available (primary model failed)
- [ ] Rate limit handling (429 responses)
- [ ] Token budget exceeded handler
- [ ] Context window exceeded handler
- [ ] Canon violation handler (reject vs flag)
- [ ] Memory store failure handler
- [ ] Embedding service failure handler
- [ ] Plugin sandbox violation handler

## Health Checks (Scheduled)

- [ ] Embedding model producing consistent vectors
- [ ] Retrieval recall within acceptable range (>80%)
- [ ] Memory consolidation running correctly
- [ ] Canon verification passing known-good queries
- [ ] Hallucination detection rate within bounds (<5%)
- [ ] Token usage within budget per entity type
- [ ] Average response latency < 2s
- [ ] Error rate < 1%
- [ ] Plugin compatibility verified
