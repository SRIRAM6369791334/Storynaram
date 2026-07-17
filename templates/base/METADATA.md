# BaseMetadata

## Purpose
Provides descriptive metadata for every entity. Powers search, display, and content management.

## Responsibilities
- Store human-readable title and description
- Provide summary for cards, previews, and search results
- Manage keywords for indexing and classification
- Track language and author
- Surface status and priority

## Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Human-readable display title (1–256 chars) |
| `language` | string | BCP-47 language tag |

## Optional Fields
- `description` — long-form description (max 4096 chars)
- `summary` — short summary (max 512 chars)
- `keywords` — search keywords array
- `author` — original creator
- `status` — lifecycle status reference
- `priority` — integer 0–100
- `version` — semantic version string

## Dependencies
- BaseStatus (for status field reference)

## Examples

```json
{
  "title": "The Shadow of the Wind",
  "description": "A young boy discovers a mysterious book...",
  "summary": "A mystery set in post-war Barcelona",
  "keywords": ["mystery", "Barcelona", "books"],
  "language": "en",
  "author": "Carlos Ruiz Zafón",
  "priority": 80,
  "version": "1.0.0"
}
```

## Inheritance Rules
- **Final**: `title`, `language`, `status`, `version`
- **Overrideable**: `description`, `summary`, `keywords`, `author`, `priority`

## Validation Rules
- `title` must be 1–256 characters
- `description` max 4096 characters
- `summary` max 512 characters
- `language` must match BCP-47 pattern `^[a-z]{2}(-[A-Z]{2})?$`
- `priority` must be 0–100
- `version` must match semver `^\d+\.\d+\.\d+$`

## Future Extensions
- SEO metadata (meta description, Open Graph, Twitter Cards)
- Content warnings and rating labels
- Automated summarization via AI
- Multi-title support (working title, subtitle, alternate title)
