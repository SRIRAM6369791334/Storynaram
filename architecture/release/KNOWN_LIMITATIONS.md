# Known Limitations

## Design Limitations

| # | Limitation | Scope | Future Resolution |
|---|------------|-------|-------------------|
| 1 | Relative $ref paths require consistent directory structure | All schemas | Phase 5: $id-based resolution |
| 2 | No dynamic schema composition at runtime | All schemas | Phase 4: Runtime Engine |
| 3 | Validation is schema-structural only — no semantic validation | All schemas | Phase 4: Validation Engine |
| 4 | Domain schema entity fields are string-typed refs (no $ref to entity schemas) | Domain schemas | Phase 5: Cross-schema $ref |
| 5 | No automated migration tools | Migration | Phase 4: Migration Framework |
| 6 | Schema evolution is manual (no automated diff/patch) | Governance | Phase 5: Evolution Tooling |
| 7 | Registry files are static JSON (no auto-generation) | Registry | Phase 4: Registry Service |
| 8 | No plugin SDK for third-party schema developers | Plugin | Phase 5: Plugin SDK |
| 9 | 118 schemas is moderate — scaling to 10K+ requires additional tooling | All schemas | Phase 5: Schema Service |
| 10 | No runtime performance benchmarks for schema validation | All schemas | Phase 4: Performance Testing |

## What RC1 Does Not Cover

- Runtime code generation
- API definitions (REST, GraphQL, gRPC)
- Storage engine schemas
- Database migrations
- Authentication/authorization runtime
- Multi-tenancy
- Caching layer
- Event streaming
- Search indexing
- Monitoring/alerting
