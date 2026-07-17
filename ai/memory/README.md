# Memory Directory

## Purpose
The Memory System Architecture. Defines how the AI stores, retrieves, consolidates, and expires memory across sessions.

## Responsibility
Manages the complete memory lifecycle â€” short-term working memory for the current session, long-term persistent memory across sessions, and specialized memory for each domain (characters, world, timeline, canon).

## Memory Types
| Type | Duration | Scope | Storage |
|------|----------|-------|---------|
| Short-Term | Session | Current interaction | In-memory |
| Long-Term | Persistent | Cross-session | File/database |
| Working | Task | Current task | In-memory |
| Book | Book duration | Per-book context | File |
| Chapter | Chapter duration | Per-chapter details | File |
| Scene | Scene duration | Per-scene state | File |
| Character | Permanent | Character knowledge | Character entity |
| Timeline | Permanent | Chronological context | Timeline entities |
| World | Permanent | World state | World entities |
| Canon | Permanent | Canonical truth | Canon records |
| Decision | Permanent | Decision history | Decision records |
| User Preference | Persistent | User settings | Config |

## Memory Expiration Policy
| Memory Type | Expiration | Consolidation Trigger |
|-------------|------------|----------------------|
| Short-Term | Session end | Summarize to long-term |
| Working | Task complete | Clear |
| Scene | Scene complete | Summarize to chapter |
| Chapter | Chapter complete | Summarize to book |
| Book | Book complete | Summarize to series |

## Input
- AI operations and their results
- User interactions
- Entity modifications

## Output
- Retrieved memory context
- Consolidated summaries
- Expired memory records

## Dependencies
- knowledge/ â€” long-term memory is knowledge
- context/ â€” memory feeds context builder
- sessions/ â€” session memory management
