# BaseSecurity

## Purpose
Manages security configuration per entity. Defines data classification, encryption, redaction, audit logging, and access policies.

## Required Fields
None (all optional)

## Optional Fields
- `classification` — data classification level
- `encryption` — field-level encryption and KMS config
- `redaction` — field redaction rules
- `auditLogging` — security audit log settings
- `accessPolicy` — ABAC policy identifier

## Inheritance Rules
- **Final**: `classification`
- **Overrideable**: `encryption.encryptedFields`, `redaction`, `auditLogging`, `accessPolicy`
