# Storynaram Project Guide

## Workflow, Conventions, and Best Practices

**Version:** 0.1.0 | **Last Updated:** 2026-07-17

---

## 1. Introduction

This guide defines the conventions, workflows, and best practices for working with Storynaram. It applies to both human authors and AI agents operating on the project.

---

## 2. Project Structure Conventions

### 2.1 Directory Structure
- Every root directory represents a **domain** or **functional area**
- Each directory contains a `README.md` explaining its purpose, conventions, and relationships
- Subdirectories organize entities by **type** or **category**
- Files are **flat** within their subdirectory — no deep nesting

### 2.2 Naming Conventions
- **Directories**: `plural_lowercase` (e.g., `characters/`, `magic/schools/`)
- **JSON files**: `snake_case.json` or `{id}.json` depending on entity type
- **Documentation**: `UPPER_SNAKE_CASE.md` for root docs (e.g., `ARCHITECTURE.md`), `README.md` for directory docs
- **ID files**: Use IDs as filenames for entity instances — always lowercase

### 2.3 ID Convention
All entity IDs follow the schema in `config/id_rules.json`:
- Format: `{domain_prefix}_{unique_suffix}`
- Prefix examples: `char_`, `world_`, `loc_`, `item_`, `org_`, `magic_`
- Example: `char_k7m9n2p1`

---

## 3. File Format Conventions

### 3.1 JSON Format
- All JSON files use UTF-8 encoding
- Indentation: 2 spaces
- Trailing newline at end of every file
- No comments in JSON files (JSON is a data format, not a config language)
- Empty arrays prefer `[]` over `null`
- Empty objects prefer `{}` over `null`

### 3.2 JSON Structure
Every entity JSON should follow this general structure:

```json
{
  "id": "{domain_prefix}_{unique_id}",
  "type": "entity_type",
  "name": "Display Name",
  "metadata": {
    "created": "2026-07-17T00:00:00Z",
    "modified": "2026-07-17T00:00:00Z",
    "version": 1,
    "status": "draft",
    "source": "author"
  },
  "data": { },
  "relationships": { },
  "tags": []
}
```

### 3.3 Markdown Format
- Use ATX headings (`#`, `##`, `###`)
- Use `-` for unordered lists, `1.` for ordered lists
- Use `|` for tables
- Use ``` for code blocks with language specification
- Use `**bold**` and `*italic*` as needed
- Use `[text](link)` for links
- Use `>` for blockquotes

---

## 4. Data Management Conventions

### 4.1 Creating New Entities
1. Determine the correct domain directory and subdirectory
2. Check `config/id_rules.json` for ID format
3. Check `schemas/` for the entity's JSON Schema
4. Use the relevant template from `templates/` if available
5. Create the JSON file with the entity's ID as the filename
6. Update any affected relationship references

### 4.2 Modifying Entities
1. Update the entity's JSON file
2. Increment the `metadata.version` field
3. Update `metadata.modified` timestamp
4. Update any affected relationship references in other files
5. Log significant changes in `logs/`

### 4.3 Deleting Entities
- Do not delete files immediately — move to `archive/`
- Update all relationship references in other entities
- Record the deletion in `logs/`
- Mark `metadata.status` as `archived`

### 4.4 Versioning
- Each entity tracks its own version in `metadata.version`
- Config-level versioning is managed in `config/version.json`
- Book-level versioning is managed in each `book_{n}/status.json`
- The global version is managed in `config/version.json`

---

## 5. AI Interaction Conventions

### 5.1 AI Context
- AI agents should read the relevant directory `README.md` before working in it
- AI agents should check `config/ai_rules.json` for behavioral constraints
- AI agents should check `config/writing_rules.json` for writing constraints
- AI agents should check `memory/` for existing knowledge before generating new content

### 5.2 AI Generation Rules
1. **Never overwrite** existing data without explicit instruction
2. **Never invent** fake IDs — use actual IDs from existing entities
3. **Never generate** confidential or proprietary content
4. **Always validate** generated content against relevant schemas
5. **Always reference** sources when generating from references
6. **Always check** canon before generating contradictory content
7. **Always log** AI operations to `logs/`

### 5.3 Prompt Usage
- Use prompts from `prompts/` for structured AI interactions
- Custom prompts should follow the format established in the prompts directory
- Prompt performance notes go in `notes/` or `prompts/` as appropriate

---

## 6. Workflow

### 6.1 Standard Workflow
1. **Plan** — Review requirements, check existing content, plan changes
2. **Prepare** — Read relevant READMEs, schemas, templates, and config
3. **Execute** — Create or modify files following conventions
4. **Validate** — Run validation scripts from `scripts/validation/`
5. **Review** — Review changes for consistency and quality
6. **Record** — Log changes, update memory, update relationships

### 6.2 AI-Assisted Workflow
1. **Context** — Provide AI with relevant context (READMEs, existing data, rules)
2. **Prompt** — Use or create a prompt from `prompts/`
3. **Generate** — Have AI generate content following all rules
4. **Validate** — Validate generated content against schemas
5. **Integrate** — Integrate into project, update relationships
6. **Review** — Review for quality and consistency

### 6.3 Review Workflow
1. **Submit** — Content ready for review
2. **Assess** — Review against writing rules, consistency, quality
3. **Feedback** — Document findings in `reviews/`
4. **Revise** — Address feedback
5. **Approve** — Mark as approved when criteria met
6. **Finalize** — Change status from `draft` to `final`

---

## 7. Backup and Safety

### 7.1 Backup Frequency
- **Before major edits** — Manual backup to `backups/`
- **Daily** — Automatic backup if scheduled
- **Before migration** — Full backup to `backups/`
- **After milestone** — Named backup to `backups/`

### 7.2 Safety Practices
- Never edit files directly in `backups/` — these are for restore only
- Never store secrets, passwords, or API keys in the project
- Keep `archive/` for deprecated content — never delete permanently
- Use `logs/` for audit trail — never delete logs

---

## 8. Multi-Book Management

- Each book is a subdirectory under `books/` named `book_{number}`
- Chapters use the format `{book_id}_chapter_{number}.json`
- Scenes use the format `{book_id}_ch{num}_scene{num}.json`
- Cross-book characters share the same ID and file in `characters/`
- Plot arcs that span multiple books link to multiple book references
- Timeline events reference the book(s) they appear in

---

## 9. File Size Management

- Keep individual JSON files under 1MB
- Subdivide large collections into logical groupings
- Timeline events should be grouped by era or century once exceeding 10,000 events
- Character files are always individual (one file per character)
- Consider migrating to database storage when total files exceed 100,000

---

## 10. Collaboration Practices

- If using version control (git):
  - One entity per file minimizes merge conflicts
  - Commit messages should reference entity IDs
  - Branch per book or per major feature
  - Review changes via diff before merging
- For team projects:
  - Assign domain ownership
  - Review cross-domain changes
  - Document decisions in `memory/decisions/`

---

*This guide evolves with the project. Update it as workflows and conventions develop.*
