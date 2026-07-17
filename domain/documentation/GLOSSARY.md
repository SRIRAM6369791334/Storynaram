# Domain Glossary

## Terms

| Term | Definition |
|------|------------|
| Aggregate | A cluster of domain objects treated as a single unit, with an aggregate root ensuring consistency |
| Aggregate Root | The root entity of an aggregate; all external references go through the root |
| Anti-Corruption Layer | A protective layer that translates between bounded contexts to prevent model corruption |
| Bounded Context | A logical boundary within which a particular domain model applies and terms have specific meaning |
| Canon | The set of entities and facts that are considered definitive and immutable truth within the story |
| Clean Architecture | A layered architecture pattern where dependencies point inward toward the domain |
| Context Map | A diagram showing relationships and translations between bounded contexts |
| Domain Event | Something that happened in the domain that domain experts care about |
| Entity | An object with a continuous identity through time and across states |
| Knowledge Graph | A graph-based representation of entities and their relationships for semantic queries |
| Lifecycle | The sequence of states an entity passes through over time, from creation to archival |
| Repository | A mechanism for retrieving and persisting aggregates, abstracting storage concerns |
| Specification | A predicate that determines whether an object satisfies certain criteria |
| Ubiquitous Language | A shared language between domain experts and developers used consistently in code and documentation |
| Value Object | An immutable object defined by its attributes, not its identity |
| Relationship | A directed or undirected connection between two entities with attributes |
| Cardinality | The numerical constraint on a relationship (one-to-one, one-to-many, many-to-many) |
| Index | A data structure that optimizes lookup and retrieval of entities by specific fields |
| Full-Text Search | A search technique that matches natural language text against indexed content |
| Geospatial Index | An index optimized for location-based and proximity queries |
| Vector Index | An index for semantic similarity search using embedding vectors |
| Primary Key | A unique identifier for an entity record in a persistence store |
| Secondary Index | An auxiliary index on non-primary fields to accelerate queries |
| Composite Index | An index on multiple columns for efficient multi-field lookups |
| State Machine | A model describing the valid states and transitions of an entity lifecycle |
