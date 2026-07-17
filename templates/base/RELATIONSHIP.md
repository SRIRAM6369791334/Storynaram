# BaseRelationship

## Purpose
Defines typed relationships between entities with full cardinality support. Foundation for the knowledge graph.

## Responsibilities
- Model one-to-one, one-to-many, many-to-many relationships
- Model composition, aggregation, association, dependency, inheritance
- Track cardinality (min/max) per relationship
- Store semantic role labels and inverse roles
- Provide graph database mapping configuration

## Required Fields
None (all optional)

## Optional Fields
- `relationships` — array of typed relationship objects
- `graphMappings` — Neo4j edge/node mapping configuration

## Dependencies
- BaseIdentifier (for targetId format)

## Examples

```json
{
  "relationships": [
    {
      "targetId": "loc_000015",
      "targetType": "location",
      "type": "association",
      "role": "livesIn",
      "inverseRole": "inhabitant",
      "cardinality": { "min": 1, "max": 1 },
      "strength": 0.9
    }
  ]
}
```

## Inheritance Rules
- **Final**: none (all overrideable)
- **Overrideable**: `relationships`, `graphMappings`

## Validation Rules
- `type` must be one of the 8 defined relationship types
- `cardinality.min` >= 0, `cardinality.max` >= 1
- `strength` must be 0–1
- `weight` must be 0–1

## Future Extensions
- Temporal relationships (valid during specific time periods)
- Weighted and scored relationships for AI reasoning
- Relationship metadata for narrative causality
- Automatic relationship inference from text analysis
