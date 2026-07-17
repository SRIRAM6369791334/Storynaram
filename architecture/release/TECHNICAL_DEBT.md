# Technical Debt

## Critical

None identified.

## High

None identified.

## Medium

| ID | Description | Impact | Recommendation | Priority |
|----|-------------|--------|----------------|----------|
| TD-001 | 27 schemas missing optional `title` field | Cosmetic — schemas still valid. Affects tooling display. | Add `"title": "{Name}"` to each. All are in validation/ and workflow/ categories. | Medium |
| TD-002 | Core schemas lack `unevaluatedProperties: false` | Intentional — core schemas are composable partials, not standalone. Non-issue. | No action required. Document as intentional design. | None |

## Low

| ID | Description | Impact | Recommendation | Priority |
|----|-------------|--------|----------------|----------|
| TD-003 | 6 governance sub-dirs lack standalone README.md | Navigation inconvenience. User must open directory to discover files. | Add brief README.md to compatibility/, discovery/, governance/, migration/, registry/, releases/ | Low |
| TD-004 | No automated validation pipeline | Manual validation only. Schema changes require manual verification. | Implement CI pipeline with Ajv or equivalent validator. | Low |
| TD-005 | Cross-schema refs use relative paths | Works correctly but fragile to directory restructuring. | Consider using $id-based resolution or canonical paths. | Low |

## Future Enhancement

| ID | Description | Priority |
|----|-------------|----------|
| FE-001 | Schema version diff tool for migration validation | Future |
| FE-002 | Automated breaking change detection | Future |
| FE-003 | Registry auto-population from schema directory scan | Future |
| FE-004 | Template-to-schema synchronization checker | Future |
| FE-005 | $id-based dynamic resolution instead of relative paths | Future |
| FE-006 | Visual schema editor with real-time validation | Future |
| FE-007 | Schema fuzzing and edge-case testing framework | Future |
