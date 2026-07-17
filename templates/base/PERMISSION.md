# BasePermission

## Purpose
Defines access control rules. Supports RBAC, ABAC, entity-level ACLs, permission inheritance, and restrictions.

## Required Fields
None (all optional)

## Optional Fields
- `accessControl.owner` — owner read/write/delete/share flags
- `accessControl.group` — group-level permissions
- `accessControl.world` — world-level role permissions
- `inheritance` — permission inheritance from parent
- `restrictions` — time/location/condition-based restrictions

## Inheritance Rules
- **Final**: `inheritance.inheritFromParent`
- **Overrideable**: `accessControl`, `restrictions`, `inheritance.overrides`
