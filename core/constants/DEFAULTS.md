# Defaults

## Purpose
Defines default values for entity fields across Storynaram.

## Entity Defaults

| Field | Default |
|-------|---------|
| metadata.version | 1 |
| metadata.status | "draft" |
| metadata.createdAt | Current UTC timestamp |
| metadata.updatedAt | Current UTC timestamp |
| data.type | None (must be specified per contract) |
| 	ags | [] (empty array) |
| elationships.parent | 
ull |
| elationships.children | [] (empty array) |
| elationships.related | [] (empty array) |

## Character Defaults
| Field | Default |
|-------|---------|
| data.age | - (must be set) |
| data.gender | - (must be set) |

## Item Defaults
| Field | Default |
|-------|---------|
| data.condition | "pristine" |
| data.rarity | "common" |
| data.magical | alse |
| data.quantity | 1 |

## Timeline Defaults
| Field | Default |
|-------|---------|
| data.date.isApproximate | alse |

## Validation Defaults
| Field | Default |
|-------|---------|
| Severity | "error" |
| Auto-fix | alse |
