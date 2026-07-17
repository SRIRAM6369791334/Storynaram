# Domain Diagrams

## Architectural and Design Visualizations

---

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    PROJECT ||--o{ SERIES : contains
    SERIES ||--o{ BOOK : contains
    BOOK ||--o{ CHAPTER : contains
    BOOK ||--o{ PART : contains
    BOOK ||--o{ ARC : contains
    CHAPTER ||--o{ SCENE : contains
    SCENE ||--o{ DIALOGUE : contains
    SCENE }o--|| LOCATION : occurs-at
    SCENE }o--|| CHARACTER : pov
    SCENE }o--o{ CHARACTER : features

    CHARACTER ||--o{ RELATIONSHIP : has
    CHARACTER ||--o{ INVENTORY : owns
    CHARACTER ||--o{ FAMILY : belongs-to
    CHARACTER ||--|| RACE : is-a
    CHARACTER ||--|| SPECIES : is-a

    CONTINENT ||--o{ COUNTRY : contains
    COUNTRY ||--o{ PROVINCE : contains
    COUNTRY ||--o{ KINGDOM : contains
    PROVINCE ||--o{ DISTRICT : contains
    DISTRICT ||--o{ CITY : contains
    DISTRICT ||--o{ VILLAGE : contains
    KINGDOM }o--|| EMPIRE : belongs-to

    TIMELINE ||--o{ ERA : contains
    TIMELINE ||--o{ CALENDAR : contains
    ERA ||--o{ EVENT : contains
    EVENT }o--o{ CHARACTER : involves
    EVENT }o--|| LOCATION : occurs-at

    ORGANIZATION ||--o{ CHARACTER : members
    MAGIC ||--o{ SPELL : contains
    SPELL }o--o{ CHARACTER : casters

    ITEM }o--|| CHARACTER : owner
    ITEM }o--|| LOCATION : stored-at
```

---

## 2. Aggregate Diagram

```mermaid
graph TB
    subgraph "Book Aggregate"
        B[Book ◆]
        B --> CH[Chapter]
        B --> P[Part]
        B --> A[Arc]
        CH --> S[Scene]
        S --> D[Dialogue]
    end

    subgraph "Character Aggregate"
        C[Character ◆]
        C --> R[Relationship]
        C --> I[Inventory]
        C --> F[Family]
        C --> M[Memory]
    end

    subgraph "World Aggregate"
        W[World ◆]
        W --> CN[Continent]
        CN --> CY[Country]
        CY --> KG[Kingdom]
        CY --> PV[Province]
        PV --> CT[City]
    end

    subgraph "Timeline Aggregate"
        T[Timeline ◆]
        T --> ER[Era]
        T --> CA[Calendar]
        ER --> EV[Event]
    end

    subgraph "Organization Aggregate"
        O[Organization ◆]
        O --> GB[Guild]
        O --> AR[Army]
        O --> CL[Clan]
    end

    subgraph "Magic Aggregate"
        M2[Magic ◆]
        M2 --> SP[Spell]
        M2 --> SK[Skill]
        M2 --> AB[Ability]
    end

    subgraph "Item Aggregate"
        I2[Item ◆]
        I2 --> WP[Weapon]
        I2 --> AM[Armor]
        I2 --> PO[Potion]
        I2 --> AR2[Artifact]
    end
```

---

## 3. Package / Context Diagram

```mermaid
graph TB
    subgraph "Narrative Context"
        BC_N[Book]
        BC_NC[Chapter]
        BC_NS[Scene]
        BC_ND[Dialogue]
        BC_NA[Arc]
    end

    subgraph "Character Context"
        BC_CH[Character]
        BC_CR[Relationship]
        BC_CI[Inventory]
        BC_CF[Family]
    end

    subgraph "World Context"
        BC_W[Geography]
        BC_WL[Location]
        BC_WC[Culture]
        BC_WR[Religion]
    end

    subgraph "Timeline Context"
        BC_T[Era]
        BC_TE[Event]
        BC_TW[War]
        BC_TP[Prophecy]
    end

    subgraph "Organization Context"
        BC_O[Guild]
        BC_OA[Army]
        BC_OC[Clan]
    end

    subgraph "Magic Context"
        BC_M[System]
        BC_MS[Spell]
        BC_MA[Artifact]
    end

    subgraph "Item Context"
        BC_I[Equipment]
        BC_IT[Treasure]
        BC_IR[Relic]
    end

    BC_N --> BC_CH
    BC_N --> BC_T
    BC_CH --> BC_W
    BC_CH --> BC_O
    BC_N --> BC_NS
    BC_NS --> BC_WL
    BC_T --> BC_CH
    BC_M --> BC_CH
    BC_I --> BC_CH
```

---

## 4. Dependency Graph

```mermaid
graph LR
    BOOK --> CHAPTER
    CHAPTER --> SCENE
    SCENE --> DIALOGUE
    SCENE --> LOCATION
    SCENE --> CHARACTER
    CHARACTER --> RELATIONSHIP
    CHARACTER --> INVENTORY
    CHARACTER --> FAMILY
    CHARACTER --> RACE
    CHARACTER --> SPECIES
    CHARACTER --> ORGANIZATION
    EVENT --> CHARACTER
    EVENT --> LOCATION
    EVENT --> WAR
    WAR --> ORGANIZATION
    ORGANIZATION --> LOCATION
    MAGIC --> SPELL
    SPELL --> CHARACTER
    ITEM --> CHARACTER
    ITEM --> LOCATION
    LORE --> CULTURE
    CULTURE --> CHARACTER
    RELIGION --> CHARACTER
    TIMELINE --> EVENT
    TIMELINE --> ERA
    WORLD --> CONTINENT
    CONTINENT --> COUNTRY
    COUNTRY --> KINGDOM
    KINGDOM --> CITY
```

---

## 5. Inheritance Hierarchy

```mermaid
graph TB
    subgraph "Character Inheritance"
        CH[Character]
        CH --> HE[Hero]
        CH --> HN[Heroine]
        CH --> VL[Villain]
        CH --> AH[AntiHero]
        CH --> SP[Supporting]
        CH --> CV[Civilian]
        CH --> RL[Ruler]
        CH --> NPC[NPC]
        CH --> CR[Creature]
        CH --> MO[Monster]
        CH --> ST[Spirit]
        CH --> GD[God]
    end

    subgraph "Location Inheritance"
        LOC[Location]
        LOC --> CT2[Continent]
        LOC --> CY2[Country]
        LOC --> KG2[Kingdom]
        LOC --> EM[Empire]
        LOC --> PR[Province]
        LOC --> DI[District]
        LOC --> CI[City]
        LOC --> VI[Village]
        LOC --> CA[Castle]
        LOC --> TE[Temple]
        LOC --> FO[Forest]
        LOC --> MT[Mountain]
        LOC --> RV[River]
        LOC --> OC[Ocean]
        LOC --> IS[Island]
        LOC --> CV2[Cave]
        LOC --> DU[Dungeon]
        LOC --> LM[Landmark]
    end

    subgraph "Organization Inheritance"
        ORG[Organization]
        ORG --> GU[Guild]
        ORG --> AR2[Army]
        ORG --> RG[Religion]
        ORG --> GV[Government]
        ORG --> SS[SecretSociety]
        ORG --> CM[Company]
        ORG --> CL2[Clan]
        ORG --> TR[Tribe]
    end

    subgraph "Magic Inheritance"
        MG[Magic]
        MG --> MS[System]
        MG --> SP2[Spell]
        MG --> SK[Skill]
        MG --> AB[Ability]
        MG --> CU[Curse]
        MG --> BL[Blessing]
        MG --> AF[Artifact]
        MG --> EL[Element]
    end

    subgraph "Item Inheritance"
        IT[Item]
        IT --> WP[Weapon]
        IT --> AM2[Armor]
        IT --> PO[Potion]
        IT --> TR2[Treasure]
        IT --> RE[Relic]
        IT --> BK[Book]
        IT --> DC[Document]
        IT --> CR2[Currency]
        IT --> FD[Food]
        IT --> MD[Medicine]
    end
```

---

## 6. Ownership / Containment Diagram

```mermaid
graph TB
    subgraph "Narrative Ownership"
        Project --> Series
        Series --> Book
        Book --> Part
        Book --> Chapter
        Book --> Arc
        Chapter --> Scene
        Scene --> Dialogue
    end

    subgraph "Character Ownership"
        Character --> Relationship
        Character --> Inventory
        Character --> Family
        Character --> Memory
    end

    subgraph "World Ownership"
        World --> Continent
        Continent --> Country
        Country --> Kingdom
        Country --> Province
        Province --> District
        District --> City
        District --> Village
        Empire --> Kingdom
    end

    subgraph "Timeline Ownership"
        Timeline --> Era
        Timeline --> Calendar
        Era --> Event
        Era --> War
        War --> Battle
    end

    subgraph "Organization Ownership"
        Organization --> Member
        Organization --> Branch
    end
```

---

## 7. Context Map

```mermaid
graph TB
    subgraph "Narrative"
        N[Book Context]
    end
    subgraph "Character"
        C[Character Context]
    end
    subgraph "World"
        W[World Context]
    end
    subgraph "Timeline"
        T[Timeline Context]
    end
    subgraph "Organization"
        O[Organization Context]
    end
    subgraph "Magic"
        M[Magic Context]
    end
    subgraph "Item"
        I[Item Context]
    end

    N -.->|Partnership| C
    N -.->|Partnership| T
    C -.->|Partnership| W
    C -.->|Partnership| O
    W -.->|Partnership| T
    M -.->|Partnership| C
    I -.->|Partnership| C

    N -.->|Conformist| N
    C -.->|Conformist| N
    W -.->|Conformist| N
    T -.->|Conformist| N
```

---

## 8. Lifecycle State Machines

### Standard Entity Lifecycle
```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review
    Review --> Approved
    Review --> Rejected
    Approved --> Locked
    Approved --> Archived
    Locked --> Archived
    Rejected --> Draft
    Archived --> [*]
```

### Book Lifecycle
```mermaid
stateDiagram-v2
    [*] --> Outline
    Outline --> Draft
    Draft --> Revision
    Revision --> Beta
    Beta --> Editing
    Editing --> Ready
    Ready --> Published
    Published --> Archived
    Draft --> Archived
    Editing --> Archived
```

### Character Lifecycle
```mermaid
stateDiagram-v2
    [*] --> Concept
    Concept --> Draft
    Draft --> Developed
    Developed --> Final
    Final --> Locked
    Final --> Archived
    Locked --> Archived
    Developed --> Archived
```
