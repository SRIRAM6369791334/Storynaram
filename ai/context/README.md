# Context Directory

## Purpose
The Context Builder Architecture. Defines how information is selected, prioritized, and packaged for AI context windows.

## Responsibility
Determines what knowledge to include in every AI request context. The Context Builder is the gatekeeper â€” it decides what fits, what gets summarized, and what gets excluded when the available knowledge exceeds the model's context window.

## Context Priority Hierarchy
`	ext
Priority 1: Current task (chapter, scene, character being worked on)
Priority 2: Directly related entities (characters in scene, location)
Priority 3: Recent changes (last 5 modified entities)
Priority 4: Active memory (current session context)
Priority 5: Project standards and rules
Priority 6: Related lore and world rules
Priority 7: Historical context (past chapters, character history)
Priority 8: Broad knowledge (encyclopedic, reference)
`

## Context Window Optimization
When context exceeds model limits:
1. Summarize lowest-priority items
2. Merge related knowledge packets
3. Remove redundant information
4. Truncate least-relevant historical data
5. Request user clarification if critical context is excluded

## Input
- User/AI task request
- Knowledge retrieval results
- Current session state
- Model context window limits

## Output
- Optimized context packet
- Priority-ordered knowledge
- Summarization decisions log

## Dependencies
- knowledge/ â€” knowledge source
- retrieval/ â€” retrieves knowledge for context
- memory/ â€” session and working memory
- ranking/ â€” priority ranking for inclusion

## Related Modules
- pipeline/ â€” assembles context into final prompt
- prompts/ â€” context fills prompt templates
- sessions/ â€” maintains context across interactions
