# Cache Directory

## Purpose
The Cache Layer Architecture. Defines how AI operations are cached for performance and cost optimization.

## Responsibility
Provides multi-level caching for AI operations â€” context cache to reuse built contexts, knowledge cache for frequently accessed entities, embedding cache for computed vectors, prompt cache for assembled prompts, and validation cache for recent validation results.

## Cache Types
| Cache | TTL | Invalidation |
|-------|-----|--------------|
| Context Cache | Session | Context change |
| Knowledge Cache | 1 hour | Entity modification |
| Embedding Cache | 24 hours | Re-indexing |
| Prompt Cache | Session | Prompt template change |
| Validation Cache | 1 hour | Entity modification |

## Cache Invalidation
- Entity modification â†’ invalidate related cache entries
- Session end â†’ clear session caches
- Manual â†’ explicit cache clear command
- Time-based â†’ TTL expiration
- Version-based â†’ schema/contract version change

## Input
- Cache key
- Cache value
- TTL specification

## Output
- Cached result (hit)
- Cache miss signal

## Dependencies
- context/ â€” context cache
- knowledge/ â€” knowledge cache
- prompts/ â€” prompt cache
