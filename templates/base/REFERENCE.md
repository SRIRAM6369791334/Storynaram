# BaseReference

## Purpose
Provides a comprehensive cross-referencing system. Every entity can reference any other entity internally or externally.

## Responsibilities
- Manage internal entity references (within the Storynaram project)
- Manage external resource references (web, file, API)
- Support cross-project/universe references
- Provide knowledge graph node/edge metadata
- Track parent-child hierarchy and generic related references

## Required Fields
None (all optional)

## Optional Fields
- `internal` — references to other Storynaram entities
- `external` — references to external resources
- `cross` — cross-project/universe references
- `graph` — knowledge graph node metadata
- `parent` — single parent reference with hierarchy path
- `children` — child entity references with counts
- `related` — generic related entity references with strength

## Dependencies
- BaseIdentifier (for reference ID format)

## Examples

```json
{
  "internal": [
    { "id": "char_000001", "type": "character", "role": "owner", "name": "John Doe" }
  ],
  "parent": { "id": "world_000042", "type": "world", "path": "/worlds/000042" },
  "external": [
    { "url": "https://example.com", "label": "Reference", "type": "web" }
  ]
}
```

## Inheritance Rules
- **Final**: none (all overrideable)
- **Overrideable**: `internal`, `external`, `cross`, `graph`, `parent`, `children`, `related`

## Validation Rules
- Internal reference IDs must match `^[a-z]+_[0-9]{6,}$`
- External URLs must be valid URIs
- Parent path must be slash-delimited hierarchy
- Children count must be non-negative integer

## Future Extensions
- Bidirectional reference validation
- Broken reference detection and cleanup
- Reference graph visualization
- Automatic reference updates on entity rename
