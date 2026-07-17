# Memory Directory

## Purpose
The knowledge and state tracking system. Every piece of information that characters, the world, and the story system know is defined and managed here.

## Responsibility
Tracks knowledge states â€” what characters know, what the world knows, what information has been revealed, canon decisions, and consistency validation data. This is the brain of the Story Operating System.

## Naming Convention
- **Subdirectories**: Functional categories (e.g., i/, character/)
- **Files**: {memory_id}.json â€” one file per memory entity
- **IDs** follow config/id_rules.json

## Directory Structure
| Subdirectory | Contents |
|-------------|----------|
| i/ | AI memory and context â€” what AI agents know about the story |
| character/ | Character knowledge states â€” what each character knows and remembers |
| world/ | World state tracking â€” current state of world entities |
| 	imeline/ | Timeline memory â€” chronological knowledge base |
| decisions/ | Decision records â€” author and AI decisions with rationale |
| canon/ | Canon definitions â€” what is official canon vs. draft/experimental |
| consistency/ | Consistency validation rules and violation records |

## Future Expansion
- Character knowledge graph
- Information flow tracking (who knows what, when)
- Canon conflict detection
- Memory decay modeling
- AI context window optimization
- Consistency validation engine
- Decision rollback and replay

## Relationships
- **All directories** memory touches every domain
- **Characters/** what characters know
- **Timeline/** chronological knowledge
- **Plots/** information reveals and character knowledge
- **Config/** consistency rules from config
- **Logs/** memory operations logged
