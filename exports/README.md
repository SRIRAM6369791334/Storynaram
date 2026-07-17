# Exports Directory

## Purpose
The export and distribution system. Generated output files ready for publishing, sharing, or distribution.

## Responsibility
Manages all generated output â€” compiled manuscripts, eBook files, print-ready PDFs, summary documents, world bible exports, and any other distributable content.

## Naming Convention
- **Subdirectories**: Export format or purpose (e.g., manuscript/, ebook/)
- **Files**: {export_id}.{format} â€” descriptive names with format extensions
- **IDs** follow config/id_rules.json

## Contents
- Compiled manuscript exports (PDF, DOCX, Markdown)
- eBook format exports (EPUB, MOBI, AZW3)
- Print-ready format exports (PDF print layout)
- World bible and reference exports
- Character guide exports
- Timeline exports
- Summary and synopsis exports
- Preview and sample exports
- Pitch document exports
- Backup export archives

## Future Expansion
- Multi-format export pipeline
- Template-based export formatting
- Custom export configuration
- Export comparison tools
- Export scheduling and automation
- Cloud publishing integration

## Relationships
- **Books/** source material for exports
- **Chapters/** chapter-level exports
- **Assets/** assets included in exports
- **Config/** export configuration settings
- **Scripts/export** export generation scripts
- **Archive/** historical exports archived
- **Backups/** pre-export backup copies
