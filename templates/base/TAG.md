# BaseTag

## Purpose
Provides flexible tagging and classification. Supports flat tags, hierarchical categories, visual labels, and taxonomy terms.

## Responsibilities
- Assign flat key-value tags with namespaces
- Assign hierarchical category paths
- Manage visual labels with color hints
- Support taxonomy vocabularies with broader/narrower terms

## Required Fields
None (all optional)

## Optional Fields
- `tags` — flat tag array with namespace and value
- `categories` — hierarchical category path assignments
- `labels` — visual labels with hex color
- `taxonomy` — vocabulary/term/broader/narrower metadata

## Dependencies
None (standalone)

## Examples

```json
{
  "tags": [
    { "name": "mood", "namespace": "theme", "value": "dark" }
  ],
  "categories": [
    { "path": "fiction/fantasy/high-fantasy", "label": "High Fantasy" }
  ],
  "labels": [
    { "text": "Major Character", "color": "#FF4444", "group": "significance" }
  ]
}
```

## Inheritance Rules
- **Final**: none (all overrideable)
- **Overrideable**: `tags`, `categories`, `labels`, `taxonomy`

## Validation Rules
- Tag namespace should be lowercase snake_case
- Category path must be slash-delimited
- Label color must match hex pattern `^#[0-9A-Fa-f]{6}$`
- Taxonomy broader/narrower must reference existing terms

## Future Extensions
- Tag-based access control
- Auto-tagging via AI classification
- Tag usage analytics and popularity tracking
- Tag schema validation (allowed tags per entity type)
