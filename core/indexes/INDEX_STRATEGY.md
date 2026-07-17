# Indexing Strategy

## Purpose
Defines the indexing strategy for efficient entity retrieval across Storynaram.

## Index Types

### Primary Index
- **Key**: Entity ID
- **Value**: File path
- **Purpose**: O(1) entity lookup by ID
- **Implementation**: Flat file map or database table

### Domain Index
- **Key**: Entity type / prefix
- **Value**: List of entity IDs
- **Purpose**: List all entities of a given type
- **Implementation**: Directory listing or prefix-based filter

### Name Index
- **Key**: Entity name (normalized)
- **Value**: Entity ID
- **Purpose**: Name-based search
- **Implementation**: Sorted map for prefix search

### Tag Index
- **Key**: Tag string
- **Value**: List of entity IDs
- **Purpose**: Tag-based filtering
- **Implementation**: Tag-to-entity inverted index

### Relationship Index
- **Key**: Entity ID
- **Value**: List of related entity IDs
- **Purpose**: Graph traversal
- **Implementation**: Adjacency list

### Temporal Index
- **Key**: Date/timestamp
- **Value**: List of event IDs
- **Purpose**: Timeline queries
- **Implementation**: Sorted time-based index

## Character Index Strategy
| Index | Key | Purpose |
|-------|-----|---------|
| Primary | Character ID | O(1) lookup |
| By Name | Character name | Name search |
| By Type | Prefix (hero, villain, etc.) | Role-based filtering |
| By Status | alive/dead/missing | Status filtering |
| By Location | Current location ID | Location-based queries |
| By Organization | Organization ID | Membership queries |
| By Tag | Tags | Tag-based filtering |

## Book Index Strategy
| Index | Key | Purpose |
|-------|-----|---------|
| Primary | Book ID | O(1) lookup |
| By Series | Series + number | Series ordering |
| By Status | Book status | Progress tracking |
| By POV | POV character | Character-centric queries |

## Timeline Index Strategy
| Index | Key | Purpose |
|-------|-----|---------|
| Primary | Event ID | O(1) lookup |
| Chronological | Date (year, month, day) | Time-based queries |
| By Era | Era ID | Era-based filtering |
| By Type | Event type | Type-based filtering |
| By Location | Location ID | Location-based queries |

## Implementation
For the file-based phase, indexes are:
- **Implicit**: Directory structure and naming conventions
- **Derived**: Generated on-demand by scripts
- **Cached**: Generated index files stored in memory/

For the database phase, indexes are:
- **Explicit**: Database table indexes
- **Composite**: Multi-column indexes for common queries
- **Full-text**: Text search indexes for content fields
