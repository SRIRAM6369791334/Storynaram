# Performance Guidelines

## Performance Targets

| Operation | Target | Hard Limit |
|-----------|--------|------------|
| Full composition (10 stages) | <100ms | <500ms |
| Single stage validation | <10ms | <50ms |
| Cache lookup | <5ms | <20ms |
| Dependency graph resolution | <20ms | <100ms |
| Template file parse | <15ms | <50ms |

## Template Size Guidelines

| Metric | Recommended | Maximum |
|--------|-------------|---------|
| Fields per template | ≤ 30 | ≤ 100 |
| Inheritance depth | ≤ 3 | ≤ 6 |
| Domain dependencies | ≤ 5 | ≤ 15 |
| Extension count | ≤ 3 | ≤ 10 |
| Plugin count | ≤ 2 | ≤ 8 |

## Merge Complexity

- Object merge cost: O(n) where n = total field count.
- Array concat + dedup: O(n log n) due to deduplication sort.
- Total merge budget: <30ms across all layers.
- If merge exceeds 30ms, consider splitting the template.

## Validation Rule Count

| Area | Recommended | Maximum |
|------|-------------|---------|
| Field validators per template | ≤ 20 | ≤ 50 |
| Business rules per domain | ≤ 10 | ≤ 25 |
| Cross-field validators | ≤ 5 | ≤ 10 |

## Plugin Overhead

- Plugin initialization: <20ms per plugin.
- Plugin memory: <5MB per plugin.
- Plugin compose phase: <15ms.
- Total plugin budget for composition: <50ms.

## Caching Strategy

| Cache | TTL | Size Limit |
|-------|-----|------------|
| Template model cache | 5 min | 500 entries |
| Composed template cache | 10 min | 200 entries |
| Dependency graph cache | 15 min | 100 graphs |
| Validation result cache | 5 min | 500 results |

## Optimization Priority

1. Cache hits (fastest)
2. Lazy loading (avoids unnecessary work)
3. Incremental validation (revalidate only changed paths)
4. Parallel stage execution (stages 7-9 can run in parallel)
