# Pipeline Diagrams

## (a) Full Composition Flow

```mermaid
flowchart TD
    Start([Entity Request]) --> Load[Load Template]
    Load --> Resolve[Resolve Inheritance Chain]
    Resolve --> Compose[Compose Domain Templates]
    Compose --> Extend[Apply Extensions]
    Extend --> Plugin[Apply Plugins]
    Plugin --> Entity[Apply Entity Overrides]
    Entity --> Merge[Deep Merge All Layers]
    Merge --> Validate[Validation Pipeline]
    Validate -->|Pass| Cache[Cache Result]
    Validate -->|Fail| Error[Error Handler]
    Cache --> Done([Return Composed Entity])
    Error --> Done
```

## (b) Inheritance Tree (All Domain Types)

```mermaid
graph TD
    BT[BaseTemplate] --> ET[EntityTemplate]
    ET --> Char[CharacterTemplate]
    ET --> Item[ItemTemplate]
    ET --> Loc[LocationTemplate]
    ET --> Quest[QuestTemplate]

    Char --> PC[PlayerCharacter]
    Char --> NPC[NPCCharacter]
    Char --> Creature[CreatureTemplate]

    Item --> Weapon[WeaponTemplate]
    Item --> Armor[ArmorTemplate]
    Item --> Consumable[ConsumableTemplate]
    Item --> Key[KeyItemTemplate]

    Loc --> Dungeon[DungeonTemplate]
    Loc --> Town[TownTemplate]
    Loc --> Wilderness[WildernessTemplate]

    Quest --> Main[MainQuestTemplate]
    Quest --> Side[SideQuestTemplate]

    PC --> Domains
    NPC --> Domains
    Weapon --> Domains
    Armor --> Domains

    subgraph Domains[Domain Compositions]
        Combat[combat/system]
        Dialogue[dialogue/trade]
        Inventory[inventory/storage]
        Magic[magic/spellcasting]
    end
```

## (c) Validation Pipeline Detail

```mermaid
flowchart TD
    Start([Merged Template]) --> S1[1. Template Exists]
    S1 --> S2[2. Inheritance Valid]
    S2 --> S3[3. Dependencies Valid]
    S3 --> S4[4. Merge Valid]
    S4 --> S5[5. Override Rules]
    S5 --> S6[6. Required Fields]
    S6 --> S7[7. Field Validation]
    S7 --> S8[8. Reference Validation]
    S8 --> S9[9. Business Rules]
    S9 --> S10[10. AI Validation]
    S10 --> Done([Composed Entity])

    subgraph Parallel[Parallel Stages 7-9]
        S7
        S8
        S9
    end

    S6 --> Parallel
    Parallel --> S10
```

## (d) Override Resolution Decision Tree

```mermaid
flowchart TD
    Check[Field present?] -->|No| System[Use system default]
    Check -->|Yes| Entity{In entity doc?}
    Entity -->|Yes| Mod{Override modifier?}
    Mod -->|final| Reject1[Reject: InvalidOverride]
    Mod -->|protected| Reject1
    Mod -->|overrideable| AcceptAccept[Use entity value]
    Mod -->|entity-only| AcceptAccept
    Entity -->|No| Ext{In extension?}
    Ext -->|Yes| Mod2{Extension allowed?}
    Mod2 -->|extension-only| Accept2[Use extension value]
    Mod2 -->|plugin-only| Skip1[Skip: not extension]
    Mod2 -->|overrideable| Accept2
    Ext -->|No| Plugin{In plugin?}
    Plugin -->|Yes| Mod3{Plugin allowed?}
    Mod3 -->|plugin-only| Accept3[Use plugin value]
    Mod3 -->|extension-only| Skip2[Skip: not plugin]
    Mod3 -->|overrideable| Accept3
    Plugin -->|No| Domain{In domain?}
    Domain -->|Yes| Accept4[Use domain value]
    Domain -->|No| Inherit[Walk inheritance chain]
    Inherit -->|Found| Accept5[Use inherited value]
    Inherit -->|Not found| System
```

## (e) Plugin Architecture with Extension Points

```mermaid
flowchart TD
    subgraph Pipeline[Composition Pipeline]
        Init[Initialize Context] --> LoadT[Load Templates]
        LoadT --> ResolveD[Resolve Dependencies]
        ResolveD --> MergeL[Merge Layers]
        MergeL --> Val[Validate]
        Val --> Final[Finalize]
    end

    subgraph Plugins[Plugin System]
        Reg[Plugin Registry]
        PL1[Plugin: Combat]
        PL2[Plugin: Dialogue]
        PL3[Plugin: Inventory]
    end

    subgraph ExtPoints[Extension Points]
        EP1[customFields]
        EP2[customMetadata]
        EP3[customComponents]
        EP4[schemaExtensions]
        EP5[pluginRegistrations]
        EP6[hooks]
    end

    Pipeline --> ExtPoints
    ExtPoints --> PL1
    ExtPoints --> PL2
    ExtPoints --> PL3
    PL1 --> Reg
    PL2 --> Reg
    PL3 --> Reg
    Reg --> Pipeline
```
