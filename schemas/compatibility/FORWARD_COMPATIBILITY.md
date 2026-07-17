# Forward Compatibility

## Rules (new schema, older consumer)

| # | Rule |
|---|------|
| 1 | Consumers MUST ignore unknown properties |
| 2 | Consumers MUST handle unknown enum values gracefully |
| 3 | Schemas MUST use `additionalProperties` or `unevaluatedProperties: false` consistently |
| 4 | New optional properties MUST NOT change semantics of existing properties |
| 5 | Forward compatibility supported within same MAJOR version |
| 6 | Cross-MAJOR forward compatibility requires explicit migration layer |

## Guidance

Forward compatibility allows a deployment to roll out a newer schema version before all consumers have been updated. It is achieved through defensive parsing on the consumer side and disciplined additive changes on the producer side.
