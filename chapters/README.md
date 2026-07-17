# Chapters Directory

## Purpose
The chapter management system. Every chapter across all books is defined and managed here.

## Responsibility
Manages chapter definitions â€” structure, word counts, POV assignments, chapter summaries, and chapter-level narrative arcs.

## Naming Convention
- **Files**: {book_id}_chapter_{number}.json (e.g., ook_001_chapter_01.json)
- **IDs** follow config/id_rules.json with book prefix
- **Structure**: Flat directory for cross-book query capability

## Contents
- Chapter metadata (title, number, book reference)
- Word count targets and actual counts
- POV character assignments
- Chapter summaries and outlines
- Scene sequences within chapter
- Chapter-level narrative goals
- Tone and pacing targets
- Revision history and draft tracking

## Future Expansion
- Chapter generation tooling
- Chapter pacing analysis
- Chapter-to-chapter transition modeling
- Chapter consistency validation
- AI-assisted chapter outlining

## Relationships
- **Books/** chapters belong to books
- **Scenes/** chapters contain scenes
- **Characters/** POV characters per chapter
- **Timeline/** chapter temporal placement
- **Plots/** chapter-level plot progression
- **Dialogues/** dialogue distributed across chapters
