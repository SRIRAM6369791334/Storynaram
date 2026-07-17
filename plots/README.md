# Plots Directory

## Purpose
The plot management system. Every narrative thread, story arc, mystery, twist, and ending across the entire series is defined and managed here.

## Responsibility
Orchestrates the narrative architecture â€” main plots, subplots, character arcs, mysteries, reveals, twists, and endings. Plots are the skeleton upon which scenes and chapters hang.

## Naming Convention
- **Subdirectories**: Functional categories (e.g., main_plot/, side_plots/)
- **Files**: {plot_id}.json â€” one file per plot entity
- **IDs** follow config/id_rules.json

## Directory Structure
| Subdirectory | Contents |
|-------------|----------|
| main_plot/ | Primary plot thread definitions â€” the central narrative |
| side_plots/ | Secondary and tertiary plot thread definitions |
| mysteries/ | Mystery definitions â€” questions, clues, reveals, red herrings |
| 	wists/ | Plot twist definitions â€” setup, execution, aftermath |
| endings/ | Ending definitions â€” planned endings, alternate endings |

## Contents (per plot file)
- Plot summary and premise
- Narrative structure (three-act, hero's journey, etc.)
- Key plot points and beats
- Character involvement in plot
- Plot-related locations
- Chronological markers
- Foreshadowing and setup tracking
- Resolution criteria
- Relationship to other plots
- Tension and pacing targets

## Future Expansion
- Plot structure visualization
- Plot hole detection
- Pacing analysis engine
- Character arc-plot alignment checker
- Mystery clue tracking and logic validation
- Plot generation assistant

## Relationships
- **Books/** plots span books or are book-specific
- **Chapters/** plot progression mapped to chapters
- **Scenes/** scenes advance specific plot threads
- **Characters/** character arcs interweave with plots
- **Timeline/** plot events at specific times
- **Mysteries/** mystery resolution tracked across plots
- **Endings/** plot resolution paths
