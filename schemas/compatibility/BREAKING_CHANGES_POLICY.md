# Breaking Changes Policy

## Requirements

| # | Requirement |
|---|-------------|
| 1 | MAJOR version bumps require: 3-month deprecation notice, migration guide, compatibility layer, automated migration tool |
| 2 | Breaking changes must be grouped — one MAJOR version per release cycle |
| 3 | Each breaking change must have: justification, impact analysis, migration path, rollback plan |
| 4 | Breaking changes require architecture board approval |
| 5 | Consumers must be notified 30 days before MAJOR release |

## Process

1. **Proposal** — Author documents the change with justification and impact analysis.
2. **Review** — Change is presented to the architecture board.
3. **Approval** — Board approves or rejects the proposal.
4. **Notice** — All consumers receive a 30-day advance notification.
5. **Deprecation** — Previous API/endpoint is deprecated with a minimum 3-month window.
6. **Migration** — Compatibility layer and automated tooling are shipped alongside the breaking change.
7. **Release** — MAJOR version is published.
8. **Rollback** — Rollback plan is executed if critical issues surface within 30 days.
