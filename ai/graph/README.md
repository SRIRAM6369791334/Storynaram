# Graph Directory

## Purpose
The Knowledge Graph Architecture. Defines how entities are connected, how the graph is traversed, and how relationships are queried.

## Responsibility
Models the complete relationship graph of the story universe. Every entity is a node; every relationship is an edge. The graph enables cross-domain reasoning, influence tracking, and narrative coherence validation.

## Graph Model
`
Nodes: Every entity (characters, locations, events, items, etc.)
Edges: Relationships (appears-in, located-at, member-of, owns, etc.)
Properties: Node and edge metadata (weight, type, direction, status)
`

## Traversal Strategies
- **BFS**: Breadth-first for influence mapping and relationship discovery
- **DFS**: Depth-first for chain-of-causality analysis
- **Shortest Path**: Minimum relationship chain between two entities
- **Subgraph**: Extract connected subgraph around an entity
- **Community Detection**: Identify clusters of related entities

## Input
- Entity relationship blocks
- Core/relationships/ models
- Canonical entity IDs

## Output
- Traversed relationship paths
- Graph query results
- Relationship statistics

## Dependencies
- core/relationships/ â€” relationship model definitions
- knowledge/ â€” knowledge nodes for graph construction
- retrieval/ â€” graph-based retrieval strategies

## Related Modules
- reasoning/ â€” uses graph for cross-domain reasoning
- canon/ â€” uses graph for conflict detection
- search/ â€” graph-indexed search
