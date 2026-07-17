# Release Policy

## Release Cadence

- **MAJOR**: Quarterly (every 3 months). Breaking changes only.
- **MINOR**: Monthly. Backward-compatible additions.
- **PATCH**: As needed. Bug fixes and non-breaking corrections.

## Release Channels

| Channel   | Purpose                                     | Stability  |
|-----------|---------------------------------------------|------------|
| alpha     | Internal testing, unstable APIs             | unstable   |
| beta      | Feature-complete, external testing          | pre-release|
| rc        | Release candidate, final validation         | candidate  |
| general   | Production-ready, stable release            | stable     |
| lts       | Long-term support, security patches only    | stable     |

## Release Process

1. **Code-Freeze** (1 week before release)
   - No new features merged
   - Bug fixes and documentation only
   - All CI gates must pass

2. **Testing** (3 days)
   - Full schema validation suite
   - Integration tests across all 5 categories
   - $ref resolution verification
   - Compatibility matrix validation

3. **Release Candidate** (2 days)
   - Tag rc1, rc2, etc.
   - Staged deployment to staging environment
   - Consumer validation period

4. **General Release**
   - Tag v{MAJOR}.{MINOR}.{PATCH}
   - Update all registry files
   - Generate release manifest
   - Publish release notes
   - Notify all consumers

## Hotfix Process

1. Critical bug reported
2. Hotfix branch cut from latest general release
3. Fix applied, tested, and reviewed
4. Hotfix release tagged as PATCH version
5. Cherry-pick into main branch
6. Consumers notified immediately
