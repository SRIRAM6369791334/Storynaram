# Weapon

**File:** `Weapon.schema.json`

**Purpose:** Defines a weapon with damage type, range, enchantments, and attunement.

**Referenced Template:** `templates/domain/Weapon.template.json`

**Core Schema:** `schemas/core/BaseEntity.schema.json` (via allOf)

**Required Entity Fields:** `id`, `prefix`, `sequence`, `type`, `title`, `language`, `createdBy`, `createdAt`, `updatedBy`, `updatedAt`

**Key Entity Constraints:** `type` enum (sword, axe, bow, dagger, spear, staff, mace, hammer, polearm, whip, flail, throwing, firearm, explosive, siege, energy, magical, other); `damageType` enum (slashing, piercing, bludgeoning, fire, ice, lightning, magical, psychic, poison, necrotic, radiant, force); `durability` 0–100; `magical`/`attunement` boolean default false

**Validation Notes:** `entity` block requires `type`. `unevaluatedProperties` is false.

**Cross-Entity References:** `owner` (Character)
