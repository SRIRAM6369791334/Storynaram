# Schema Review Checklist

Use this checklist when reviewing a schema change. Each item should be checked off before the schema advances to the next lifecycle stage.

## JSON Schema Compliance

- [ ] **Draft 2020-12 compliant** — Schema validates against the JSON Schema Draft 2020-12 meta-schema
- [ ] **`$schema` declared** — Correct `$schema` URI present and matches Draft 2020-12
- [ ] **No deprecated keywords** — Uses only keywords valid for Draft 2020-12

## Naming & Identification

- [ ] **`$id` follows naming standard** — Matches `https://storynaram.dev/schemas/{category}/{Name}.schema.json`
- [ ] **`title` and `description` present** — Both fields are non-empty and meaningful
- [ ] **File name matches PascalCase** — File name matches the naming standard in SCHEMA_NAMING_STANDARD.md
- [ ] **Property names are camelCase** — All property names use camelCase
- [ ] **Enum values are kebab-case** — Multi-word enum values use kebab-case

## Reference Integrity

- [ ] **All `$ref` targets exist** — Every reference resolves to an existing schema or `$def`
- [ ] **No circular dependencies** — Reference graph contains no cycles
- [ ] **`$ref` paths are correct** — Relative paths resolve correctly from the schema's location
- [ ] **External `$ref`s use proper category paths** — Cross-category references follow the correct directory structure

## Schema Structure

- [ ] **Appropriate keyword usage** — Uses `properties`, `items`, `oneOf`, `anyOf`, `allOf` correctly
- [ ] **`unevaluatedProperties: false` set** — Prevents accidental extra properties (unless intentionally open)
- [ ] **`additionalProperties` properly configured** — Either `false` or explicitly allowed with a schema
- [ ] **`required` array is accurate** — Lists only truly required properties
- [ ] **`$defs` properly organized** — Supporting types in `$defs`, not inline duplicates

## Type Constraints

- [ ] **`enum` values are exhaustive** — Covers all expected values, documented if intentionally partial
- [ ] **`numeric` fields have `minimum`/`maximum`** — Bounded where applicable
- [ ] **`string` fields have `minLength`/`maxLength`** — Bounded where applicable
- [ ] **`array` fields have `minItems`/`maxItems`** — Bounded where applicable
- [ ] **`date-time` fields use `format: "date-time"`** — Proper format constraint applied
- [ ] **`uri` fields use `format: "uri"`** — Proper format constraint applied
- [ ] **Pattern constraints are documented** — Regex patterns include explanatory comments

## Documentation

- [ ] **README exists for schema** — Located in the same directory as the schema file
- [ ] **Examples provided** — At least one valid example in `examples` array
- [ ] **Edge case examples** — For stable schemas, edge cases are covered
- [ ] **Description explains semantics** — Description goes beyond restating the name; explains meaning and usage

## Cross-Schema Impact

- [ ] **Cross-schema impact assessed** — All schemas that depend on this one are identified
- [ ] **Dependency registry updated** — Any new or changed dependencies are recorded
- [ ] **Consumer registry reviewed** — Known consumers are assessed for impact
- [ ] **Compatibility with dependent schemas verified** — Dependent schemas remain valid

## Versioning & Compatibility

- [ ] **Backward compatibility verified** — Compatibility analyzer confirms no breaking changes (or MAJOR bump if breaking)
- [ ] **Version bump is correct** — MAJOR, MINOR, or PATCH bump follows VERSION_POLICY.md rules
- [ ] **Pre-release tag correct** — `-alpha`, `-beta`, `-rc` used appropriately if applicable
- [ ] **`x-storynaram.version` matches** — In-schema version matches the registry version

## Registry & Release

- [ ] **Registry entry exists/updated** — Category registry file has the correct version and status
- [ ] **Migration path documented** — For breaking changes, migration steps are provided
- [ ] **Test examples validate** — All examples pass validation against the updated schema
- [ ] **Release note entry prepared** — Change is summarized for release notes

## Security & Governance

- [ ] **Data classification documented** — Sensitivity level is recorded if schema handles protected data
- [ ] **Access patterns documented** — How the schema data is accessed and by whom
- [ ] **No secrets or credentials** — Schema does not contain hardcoded secrets, keys, or tokens
- [ ] **PII handling reviewed** — If PII is involved, handling is documented and compliant

## Final Approvals

- [ ] **Peer review completed** — At least one Schema Steward from another category approved
- [ ] **Architecture review completed** — Schema Owner or designate approved
- [ ] **Security review completed** — (If applicable) Security review approved
- [ ] **Schema Owner sign-off** — Final approval obtained

---

## Quick Reference: Required Checks by Lifecycle Stage

| Checklist Section | draft | experimental | stable | deprecated | archived |
|-------------------|:-----:|:------------:|:------:|:----------:|:--------:|
| JSON Schema Compliance | ✓ | ✓ | ✓ | ✓ | ✓ |
| Naming & Identification | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reference Integrity | ✓ | ✓ | ✓ | ✓ | ✓ |
| Schema Structure | ✓ | ✓ | ✓ | ✓ | ✓ |
| Type Constraints | ✓ | ✓ | ✓ | — | — |
| Documentation | — | ✓ | ✓ | — | — |
| Cross-Schema Impact | — | ✓ | ✓ | ✓ | ✓ |
| Versioning & Compatibility | — | — | ✓ | — | — |
| Registry & Release | — | ✓ | ✓ | ✓ | ✓ |
| Security & Governance | — | (if needed) | ✓ | (if needed) | — |
| Final Approvals | — | ✓ | ✓ | ✓ | ✓ |
