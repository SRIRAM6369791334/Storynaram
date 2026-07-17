# Ownership Directory

## Purpose
Defines the Ownership Model for the Storynaram domain model.

## Responsibility
Defines containment and ownership relationships â€” which entities own which, how ownership flows through the hierarchy, and the rules governing ownership changes.

## Ownership Hierarchy
`	ext
Project
  â””â”€â”€ Series
       â””â”€â”€ Book
            â”œâ”€â”€ Part
            â”œâ”€â”€ Chapter
            â”‚    â””â”€â”€ Scene
            â”‚         â””â”€â”€ Dialogue
            â””â”€â”€ Arc

Character
  â”œâ”€â”€ Family
  â”œâ”€â”€ Relationships
  â”œâ”€â”€ Inventory
  â””â”€â”€ Memories

World
  â”œâ”€â”€ Continent
  â”‚    â””â”€â”€ Country
  â”‚         â””â”€â”€ Kingdom
  â”‚              â””â”€â”€ Empire
  â”‚              â””â”€â”€ Province
  â”‚                   â””â”€â”€ District
  â”‚                        â”œâ”€â”€ City
  â”‚                        â””â”€â”€ Village
  â””â”€â”€ Geography Features
`

## Ownership Rules
| Owner | Owned | Type | Cardinality |
|-------|-------|------|-------------|
| Book | Chapter | Composition | 1:N |
| Chapter | Scene | Composition | 1:N |
| Scene | Dialogue | Composition | 1:N |
| Character | Inventory | Aggregation | 1:N |
| Character | Relationships | Composition | 1:N |
| Organization | Members | Aggregation | 1:N |
| Kingdom | City | Composition | 1:N |
| Continent | Country | Composition | 1:N |

## Dependencies
- entities/ â€” entities with ownership relationships
- relationships/ â€” ownership is a relationship type
- lifecycles/ â€” ownership affects lifecycle
