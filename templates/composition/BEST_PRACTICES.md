# Best Practices for Template Authors

## Composition Over Inheritance

- Prefer domain composition (`composes`) over deep inheritance chains.
- Limit inheritance depth to 3 levels for readability.
- Use abstract templates for common shapes only.

## Keep Domain Templates Focused

- Each domain template should address exactly one concern (combat, dialogue, inventory, etc.).
- A domain template should not exceed 30 fields.
- Name domain templates by their concern: `combat/melee`, `dialogue/trade`.

## Use Validation Blocks Over Custom Code

- Declare constraints declaratively in template schemas.
- Use `min`, `max`, `pattern`, `enum` instead of custom validation scripts.
- Reserve custom validators for cross-field rules only.

## Document All Overrides

- Every `final`, `protected`, or `overrideable` modifier should have a `description` explaining why.
- Annotate override intent:

```yaml
- name: stats.hp
  modifier: protected
  description: "Character base HP must be set by the game designer, not the entity"
```

## Version All Changes

| Change | Version Bump |
|--------|-------------|
| Bug fix (no contract change) | Patch |
| New optional field | Minor |
| New required field | Major |
| Field removal | Major |
| Constraint tightening | Major |

## Template File Organization

```
templates/
  base.yaml                # BaseTemplate
  entity/
    character.yaml         # CharacterTemplate (abstract)
    character/
      player.yaml          # PlayerCharacterTemplate (concrete)
      npc/
        merchant.yaml
        guard.yaml
    item/
      weapon.yaml
  domain/
    combat/
      melee.yaml
      ranged.yaml
    dialogue/
      trade.yaml
```

## Checklist Before Publishing

- [ ] Inheritance chain terminates at a concrete template
- [ ] All abstract fields are resolved
- [ ] All `required` fields are present
- [ ] Dependencies use `^` or `>=` ranges (not pinned)
- [ ] No `final` fields are overridden
- [ ] Entity document validates successfully through all 10 stages
