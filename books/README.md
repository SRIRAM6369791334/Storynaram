# Books Directory

## Purpose
The book management system. Each book in the series is a self-contained module within this directory.

## Responsibility
Manages individual book definitions â€” metadata, structure, narrative arc, and per-book configuration. Books are the top-level narrative containers.

## Naming Convention
- **Subdirectories**: ook_{number} zero-padded (e.g., ook_001/, ook_002/)
- **Files**: {book_id}.json â€” book definition files
- **IDs** follow config/id_rules.json

## Structure
Each book subdirectory contains:
| File | Purpose |
|------|---------|
| ook.json | Book metadata, title, subtitle, blurb, word count target |
| structure.json | Three-act structure, part divisions, chapter mapping |
| characters.json | Character roster specific to this book |
| settings.json | Book-specific writing settings |
| 
otes.json | Author notes for this book |
| status.json | Writing progress, draft status, revision status |

## Future Expansion
- Book generation pipeline
- Multi-book arc tracking
- Series-level structure management
- Per-book AI context configuration
- Publishing pipeline integration

## Relationships
- **Chapters/** books contain chapters
- **Plots/** book-level plot arcs
- **Characters/** character arcs across books
- **Timeline/** book timeframe
- **Scenes/** scenes organized by book and chapter
- **Config/** book settings inherit and override global config
