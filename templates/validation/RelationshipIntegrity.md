# RelationshipIntegrity

**File:** `RelationshipIntegrity.template.json`

**Purpose:** Validates relationships between entity types including cardinality, bidirectionality, symmetry, and strength constraints.

**Inputs:** `sourceType`, `targetType`, `relationshipType`, `cardinalityCheck`, `bidirectionalCheck`, `symmetryCheck`, `strengthRange`

**Outputs:** Relationship validation results ensuring consistent and valid entity connections.

**Dependencies:** Entity templates for source and target types; `BaseRelationship` for relationship structure; `ValidationProfile` for orchestration.

**Validation Rules:** Validates cardinality (one-to-one, one-to-many, many-to-many); ensures bidirectional references remain consistent; checks symmetry; enforces strength range values.

**Future Extensions:** Weighted relationship graphs with transitive closure validation.
