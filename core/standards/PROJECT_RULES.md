# Project Rules

## Purpose
Defines the overarching governance rules for the Storynaram project. These rules take precedence over all other standards and documentation.

---

## Rule 1: Standards Are Immutable
All documents in core/standards/ are considered immutable once approved.
- Amendments require a MAJOR version change
- Amendments must be documented in CHANGE_POLICY.md
- Amendments must be reviewed and approved
- Temporary exceptions are not permitted

---

## Rule 2: Contracts Are Binding
All entity data must conform to the contracts in core/contracts/.
- No entity may have fields outside its contract
- No entity may lack required contract fields
- Contract changes follow CHANGE_POLICY.md
- Legacy data must migrate within 2 MAJOR versions

---

## Rule 3: No Story Content in Core
The core/ directory and config/ directory must never contain story content.
- No character data
- No plot details
- No narrative text
- No scene descriptions
- Only standards, contracts, rules, and configuration

---

## Rule 4: Single Source of Truth
Every piece of information exists in exactly one location.
- No data duplication across directories
- References (IDs) instead of copying data
- Derived data is computed, not stored
- Cached data is marked as cache and has a source reference

---

## Rule 5: IDs Are Permanent
Once assigned, an entity ID is permanent and immutable.
- Never reuse IDs
- Never modify IDs
- Never swap IDs between entities
- Archived entities retain their IDs

---

## Rule 6: Everything Is Validatable
Every piece of data in Storynaram must be automatically validatable.
- JSON files validate against schemas
- References validate for integrity
- Metadata validates for completeness
- Naming validates for convention conformance

---

## Rule 7: AI Augments, Does Not Replace
AI agents assist human authors but do not replace human creative authority.
- All AI-generated content is tagged i-generated
- Human review is required before finalization
- AI may not make structural/architectural decisions
- AI may not modify config/ or core/ without explicit instruction
- Final creative authority rests with the human author

---

## Rule 8: Backward Compatibility
Breaking changes must provide a migration path.
- Deprecation period: 2 MAJOR versions minimum
- Legacy format readers must be maintained during deprecation
- Automated migration scripts are required for breaking changes
- Breaking changes require project owner approval

---

## Rule 9: Documentation Is Code
Documentation is subject to the same quality standards as code.
- README files are required for every directory
- Standards must be complete and unambiguous
- Contracts must be accurate and up-to-date
- Documentation changes require review
- Outdated documentation is a bug

---

## Rule 10: The Project Book is This Repository
The Storynaram repository is the single, authoritative "book" for the project.
- Everything needed to understand the project is in the repository
- External tools and services are conveniences, not requirements
- The repository must be self-sufficient for core operations
- Any external dependency must be documented in config/

---

## Rule 11: Scalability by Design
All decisions must account for the project's scale targets:
- 100+ books
- 10,000+ characters
- Millions of timeline events
- Unlimited chapters and scenes
- Solutions that work at small scale but fail at large scale are rejected

---

## Rule 12: Change Must Be Traceable
Every change to the project must be traceable.
- Entity versions track modification history
- Logs record system operations
- Changelog documents significant changes
- Decision records explain why changes were made
- Audit trail enables rollback

---

## Rule 13: Cross-Domain Consistency
When data in one domain affects another domain, consistency must be maintained.
- Character locations must exist in world/
- Timeline events must reference valid locations
- Organization members must be valid characters
- Item owners must be valid characters
- Cross-domain validators enforce these rules

---

## Rule 14: Security First
Security is not optional.
- No secrets in the repository
- No PII in entity data
- No unvalidated external data imports
- API keys in environment variables only
- Access control for collaborative features (future)

---

## Rule 15: Keep It Simple
Complexity is a liability.
- Prefer simple solutions over clever ones
- Prefer flat structures over deep nesting
- Prefer clear naming over abbreviated naming
- Prefer explicit over implicit
- When in doubt, optimize for readability

---

## Application
These rules apply to all human contributors and AI agents. Violations must be documented in logs/ and corrected. Persistent violations may result in restricted access.

## Amendments
Amendments to PROJECT_RULES.md require:
1. Written proposal with rationale
2. Review by project owner
3. 7-day comment period (minimum)
4. Majority approval
5. Documentation of the amendment in CHANGELOG.md
