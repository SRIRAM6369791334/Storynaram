# Inheritance Directory

## Purpose
Defines the Inheritance Hierarchy for the Storynaram domain model.

## Responsibility
Documents type specialization hierarchies â€” how entity types inherit from parent types and what specializations exist.

## Inheritance Trees
`	ext
Character
  â”œâ”€â”€ Hero (protagonist)
  â”œâ”€â”€ Heroine (female protagonist)
  â”œâ”€â”€ Villain (antagonist)
  â”œâ”€â”€ AntiHero (morally ambiguous)
  â”œâ”€â”€ Supporting (supporting role)
  â”œâ”€â”€ Civilian (non-combatant)
  â”œâ”€â”€ Ruler (leader/monarch)
  â”œâ”€â”€ NPC (non-player)
  â”œâ”€â”€ Creature (non-humanoid)
  â”œâ”€â”€ Monster (hostile entity)
  â”œâ”€â”€ Spirit (ethereal entity)
  â””â”€â”€ God (divine entity)

Location
  â”œâ”€â”€ Continent
  â”œâ”€â”€ Country
  â”œâ”€â”€ Kingdom
  â”œâ”€â”€ Empire
  â”œâ”€â”€ State
  â”œâ”€â”€ Province
  â”œâ”€â”€ District
  â”œâ”€â”€ City
  â”œâ”€â”€ Village
  â”œâ”€â”€ Castle
  â”œâ”€â”€ Temple
  â”œâ”€â”€ Forest
  â”œâ”€â”€ Mountain
  â”œâ”€â”€ River
  â”œâ”€â”€ Ocean
  â”œâ”€â”€ Island
  â”œâ”€â”€ Cave
  â”œâ”€â”€ Dungeon
  â””â”€â”€ Landmark

Organization
  â”œâ”€â”€ Guild
  â”œâ”€â”€ Army
  â”œâ”€â”€ Religion
  â”œâ”€â”€ Government
  â”œâ”€â”€ SecretSociety
  â”œâ”€â”€ Company
  â”œâ”€â”€ Clan
  â””â”€â”€ Tribe

Magic
  â”œâ”€â”€ Spell
  â”œâ”€â”€ Skill
  â”œâ”€â”€ Ability
  â”œâ”€â”€ Curse
  â”œâ”€â”€ Blessing
  â”œâ”€â”€ Artifact
  â””â”€â”€ Element

Item
  â”œâ”€â”€ Weapon
  â”œâ”€â”€ Armor
  â”œâ”€â”€ Potion
  â”œâ”€â”€ Treasure
  â”œâ”€â”€ Relic
  â”œâ”€â”€ Book
  â”œâ”€â”€ Document
  â”œâ”€â”€ Currency
  â”œâ”€â”€ Food
  â””â”€â”€ Medicine
`

## Dependencies
- entities/ â€” entity type definitions with inheritance
- relationships/ â€” inheritance is a relationship type
