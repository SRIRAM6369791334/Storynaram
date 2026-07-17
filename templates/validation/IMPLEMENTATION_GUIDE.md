# Validation Framework — Implementation Guide

## Step 1: Define Validation Profiles

Per entity type, create a validation profile:

```json
{
  "profileId": "character-validation",
  "name": "Character Validation Profile",
  "entityTypes": ["character"],
  "mode": "strict",
  "rules": ["char-id-format", "char-required-fields", "char-reference-integrity"],
  "priority": 100
}
```

## Step 2: Define Rules

```json
{
  "ruleId": "char-id-format",
  "name": "Character ID Format",
  "scope": "field",
  "severity": "critical",
  "category": "pattern",
  "field": "identifier.id",
  "condition": "matches(^char_[0-9]{6,}$)",
  "message": "Character ID must match format char_XXXXXX",
  "recovery": "auto-fix"
}
```

## Step 3: Configure Reference Integrity

```json
{
  "referenceFields": [
    { "field": "references.internal[*].id", "targetType": "*", "required": false, "cascadeDelete": false }
  ],
  "orphanCheck": { "enabled": true },
  "cycleDetection": { "enabled": true, "maxDepth": 10 }
}
```

## Step 4: Configure Relationship Integrity

```json
{
  "cardinalityCheck": { "enabled": true },
  "bidirectionalCheck": { "enabled": true },
  "symmetryCheck": { "enabled": true }
}
```

## Step 5: Run Validation Pipeline

```bash
# Validate a single entity
validate --entity char_000001 --profile character-validation

# Validate all entities of a type
validate --entity-type character --profile character-validation

# Validate cross-entity references
validate --cross-references --recursive

# Validate workflows
validate --workflow character-lifecycle

# Run full pipeline
validate --pipeline --all
```

## Integration with Existing Templates

| Framework | Integration Point |
|-----------|------------------|
| Base Templates | ValidationRule checks BaseEntity required fields |
| Domain Templates | BusinessRule validates domain-specific invariants |
| AI Templates | AIValidationProfile validates AI outputs |
| Workflow Templates | WorkflowValidation validates state machines |
| Composition Engine | Composition validation ensures merge correctness |
| Registries | ReferenceIntegrity validates registry entries |
