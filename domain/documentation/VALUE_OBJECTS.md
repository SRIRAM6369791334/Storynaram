# Value Objects

## Immutable, Identity-less Domain Objects

---

## 1. Core Value Objects

### Name

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| first | string | Yes | Given name |
| middle | string | No | Middle name |
| last | string | Yes | Family name |
| title | string | No | Honorific (Lord, Sir, etc.) |
| suffix | string | No | Suffix (Jr., III, etc.) |
| nickname | string | No | Alternative name |
| fullName | string | Computed | Assembled full name |

### Coordinates

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| latitude | float | Yes | -90 to 90 |
| longitude | float | Yes | -180 to 180 |
| elevation | float | No | Meters above/below sea level |
| precision | enum | No | Exact, Approximate, Unknown |

### DateRange

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| start | datetime | Yes | Start of range |
| end | datetime | No | End of range (null = ongoing) |
| isApproximate | boolean | Yes | Whether dates are approximate |
| calendar | ref | No | Calendar system used |
| precision | enum | No | Day, Month, Year, Decade, Century, Era |

### Money

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| amount | decimal | Yes | Currency amount |
| currency | string | Yes | Currency code |
| exchangeRate | float | No | Rate to base currency |

### Measurement

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| value | float | Yes | Numeric value |
| unit | string | Yes | Unit of measurement |
| system | enum | No | Metric, Imperial, Custom |

### Address

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| street | string | No | Street address |
| city | string | Yes | City or settlement |
| province | string | Yes | Province or state |
| country | string | Yes | Country |
| postalCode | string | No | Postal/ZIP code |
| coordinates | ref | No | Geographic coordinates |
| isVirtual | boolean | Yes | Whether location is virtual |

### Description

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| short | string | Yes | One-line summary (max 200 chars) |
| medium | string | No | Paragraph description |
| long | string | No | Full detailed description |
| tags | string[] | No | Associated tags |

---

## 2. Identity References

### Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| entityId | string | Yes | Referenced entity's ID |
| entityType | enum | Yes | Type of referenced entity |
| role | string | No | Role in the context |
| label | string | No | Human-readable label |

---

## 3. Metadata Value Objects

### AuditInfo

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| createdBy | string | Yes | User/system that created |
| createdAt | datetime | Yes | Creation timestamp |
| updatedBy | string | Yes | Last modifier |
| updatedAt | datetime | Yes | Last modification timestamp |
| version | int | Yes | Version counter |

### StatusInfo

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| status | enum | Yes | Current lifecycle status |
| previousStatus | enum | No | Immediate prior status |
| statusChangedAt | datetime | No | When status last changed |
| statusChangedBy | string | No | Who changed the status |
| reason | string | No | Reason for status change |

### Tag

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| name | string | Yes | Tag text |
| category | string | No | Tag category/namespace |
| color | string | No | Display color (hex) |

---

## 4. Narrative Value Objects

### DialogueLine

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| speakerId | string | Yes | Character speaking |
| lineNumber | int | Yes | Sequential line number |
| text | string | Yes | Dialogue text |
| direction | string | No | Stage direction |
| emotion | string | No | Associated emotion |
| language | string | No | In-universe language |

### PlotPoint

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| chapter | ref | Yes | Associated chapter |
| scene | ref | Yes | Associated scene |
| type | enum | Yes | Plot point type |
| description | string | Yes | What happens |
| significance | enum | No | Major, Minor, Critical |

---

## 5. World Value Objects

### Climate

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| zone | enum | Yes | Tropical, Temperate, Arctic, etc. |
| temperature | Measurement | Yes | Average temperature |
| precipitation | Measurement | No | Annual precipitation |
| seasons | string[] | No | Season names |

### Population

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| total | long | Yes | Total population |
| demographics | map | No | Breakdown by group |
| density | float | No | Population density |

---

## 6. Magic Value Objects

### ManaCost

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| amount | int | Yes | Mana cost amount |
| type | string | No | Mana type (if multiple types) |
| perTarget | boolean | No | Whether cost scales with targets |

### SpellEffect

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| type | string | Yes | Effect type |
| magnitude | float | No | Effect strength |
| duration | Measurement | No | How long effect lasts |
| area | Measurement | No | Area of effect |
| target | enum | No | Self, Single, Area, Touch |

---

## 7. Industry-Standard Validation Rules

| Value Object | Validation Rule |
|-------------|-----------------|
| Name | Non-empty first and last; max 100 chars each |
| Coordinates | Latitude -90 to 90; Longitude -180 to 180 |
| Money | Amount ≥ 0 with 2 decimal places |
| Measurement | Value ≥ 0 |
| Description | Short ≤ 200 chars |
| Reference | Entity ID must match valid prefix pattern |
| DateRange | Start ≤ End (when both present) |
| DialogueLine | Line number ≥ 1 |
