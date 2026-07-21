# Characters Directory

## Purpose
The complete character management system. Every entity with agency, personality, and narrative significance is defined here. Supports over 10,000 characters with full relational depth.

## Responsibility
Defines every character â€” their identity, psychology, abilities, history, relationships, and narrative arc. This directory models characters as rich, interconnected entities with full lifecycle tracking from birth to death (and beyond).

## Naming Convention
- **Subdirectories**: plural_lowercase (e.g., heroes/, illains/)
- **Files**: {character_id}.json â€” one file per character
- **IDs** follow config/id_rules.json schema

## Directory Structure
| Subdirectory | Contents |
|-------------|----------|
| heroes/ | Protagonist character definitions |
| heroines/ | Heroine character definitions |
| illains/ | Antagonist character definitions |
| ntiheroes/ | Morally ambiguous protagonist definitions |
| supporting/ | Supporting character definitions |
| civilians/ | Non-combatant civilian definitions |
| ulers/ | Monarch, leader, and ruler definitions |
| gods/ | Divine entity and deity definitions |
| monsters/ | Monster and beast character definitions |
| creatures/ | Non-humanoid creature definitions |
| spirits/ | Spirit, ghost, and ethereal entity definitions |
| amilies/ | Family tree and household definitions |
| elationships/ | Character relationship graph data |
| genealogy/ | Lineage and ancestry records |
| emotions/ | Emotional state tracking and psychology profiles |
| personalities/ | Personality trait definitions (MBTI, Enneagram, etc.) |
| bilities/ | Character skill, power, and talent definitions |
| inventory/ | Character inventory and equipment tracking |
| injuries/ | Physical and psychological injury records |
| memories/ | Character memory and experience records |
| deaths/ | Death records and circumstances |

## Future Expansion
- Character voice synthesis profiles
- Emotional arc modeling
- Relationship graph visualization
- Dialogue generation profiles
- Character consistency validation engine

## Relationships
- **Timeline/** character events reference timeline entries
- **World/** characters reference world locations
- **Organizations/** characters are members of organizations
- **Dialogue/** character speech is stored in dialogues
- **Memory/** tracks what each character knows
- **Plots/** character arcs align with plot structures
