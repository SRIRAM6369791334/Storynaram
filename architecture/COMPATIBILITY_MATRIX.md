# Compatibility Matrix

## Technology and Platform Compatibility Assessment

---

## 1. Database Compatibility

| Feature | SQLite | PostgreSQL | MongoDB | Neo4j |
|---------|--------|------------|---------|-------|
| Entity storage | ✅ Tables | ✅ Tables | ✅ Documents | ❌ (graph-optimized) |
| Relationship storage | ✅ FK constraints | ✅ FK constraints | ❌ Manual refs | ✅ Native edges |
| JSON/JSONB | ✅ (JSON1 ext) | ✅ (JSONB) | ✅ (native) | ❌ |
| Full-text search | ✅ (FTS5) | ✅ (GIN) | ✅ (text index) | ❌ |
| Geospatial | ❌ (extensions) | ✅ (PostGIS) | ✅ (2dsphere) | ❌ |
| Vector storage | ❌ (extensions) | ✅ (pgvector) | ✅ (Atlas) | ❌ |
| ACID transactions | ✅ | ✅ | ⚠️ (single doc) | ✅ |
| Concurrency | ❌ (write lock) | ✅ (MVCC) | ✅ (MVCC) | ✅ |
| Migration complexity | Low | Medium | Medium | High |
| File-based compat | ✅ (single file) | ❌ (server) | ❌ (server) | ❌ (server) |
| Best for | Development | Primary prod | Document-rich | Graph traversal |

### Verdict
- **Phase 1-3**: SQLite (simple, file-based, no server)
- **Phase 4-8**: SQLite + file-based (no change needed)
- **Phase 9+**: PostgreSQL primary, SQLite fallback, Neo4j for graph queries

---

## 2. AI Model Compatibility

| Feature | OpenAI GPT-4 | Claude 3 | Gemini Pro | Local LLM |
|---------|-------------|----------|------------|-----------|
| Context window | 128K | 200K | 1M | 4K-32K |
| Prompt templates | ✅ | ✅ | ✅ | ⚠️ (smaller) |
| Token pricing | $$$ | $$ | $ | Free |
| Offline support | ❌ | ❌ | ❌ | ✅ |
| Custom fine-tuning | ✅ | ❌ | ✅ | ✅ |
| Function calling | ✅ | ✅ | ✅ | ⚠️ (limited) |
| Streaming | ✅ | ✅ | ✅ | ✅ |
| Embedding models | ✅ (ada-002) | ✅ | ✅ | ⚠️ (limited) |
| Rate limits | Moderate | Moderate | Higher | None |

### Verdict
- The AI architecture is model-agnostic by design. All models compatible.
- Prompt assembly in `ai/prompts/` supports different template formats per model.
- Context Builder's priority hierarchy adapts to available context window.

---

## 3. Vector Database Compatibility

| Feature | Pinecone | Qdrant | Weaviate | Milvus | pgvector |
|---------|---------|--------|---------|--------|---------|
| Self-hosted | ❌ | ✅ | ✅ | ✅ | ✅ |
| Managed | ✅ | ✅ | ✅ | ✅ | ❌ (via Supabase) |
| Free tier | ✅ (limited) | ✅ | ✅ | ❌ | ✅ |
| Dimensions | Up to 20K | Up to 65K | Up to 65K | Up to 65K | Up to 2K |
| Metadata filter | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multi-tenancy | ✅ | ✅ | ✅ | ✅ | ❌ |
| Backup | ❌ | ✅ | ✅ | ✅ | ✅ |
| Best for | Quick start | Self-hosted | Full-featured | Scale | PostgreSQL integration |

### Verdict
- Phase 5: Use pgvector (simplest integration with primary DB)
- Phase 8: Consider Qdrant or Weaviate for scale

---

## 4. Runtime Compatibility

| Feature | Python | Node.js | Go | Rust |
|---------|--------|---------|----|------|
| File system access | ✅ | ✅ | ✅ | ✅ |
| JSON parsing | ✅ | ✅ | ✅ | ✅ |
| SQLite support | ✅ | ✅ | ✅ | ✅ |
| PostgreSQL driver | ✅ | ✅ | ✅ | ✅ |
| Neo4j driver | ✅ | ✅ | ✅ | ✅ |
| Vector DB support | ✅ | ✅ | ⚠️ | ⚠️ |
| AI API SDKs | ✅ | ✅ | ✅ | ❌ |
| Scripting flexibility | ✅ | ✅ | ❌ | ❌ |
| Ecosystem maturity | ✅ | ✅ | ✅ | ⚠️ |

### Verdict
- **Phase 3+**: Python recommended (best AI/ML ecosystem, rich JSON libs, cross-platform)
- **Alternative**: Node.js (if JavaScript ecosystem preferred)

---

## 5. Export Format Compatibility

| Format | Books | Characters | World | Timeline |
|--------|-------|-----------|-------|----------|
| Markdown | ✅ | ✅ | ✅ | ✅ |
| HTML | ✅ | ✅ | ✅ | ✅ |
| EPUB | ✅ | ❌ | ❌ | ❌ |
| PDF | ✅ | ✅ | ✅ | ✅ |
| JSON | ✅ | ✅ | ✅ | ✅ |
| CSV | ❌ | ✅ | ✅ | ✅ |
| LaTeX | ✅ | ❌ | ❌ | ❌ |
| DOCX | ✅ | ✅ | ✅ | ✅ |

---

## 6. OS Compatibility

| Feature | Windows | macOS | Linux |
|---------|---------|-------|-------|
| PowerShell scripts | ✅ Native | ✅ (pwsh) | ✅ (pwsh) |
| Python scripts | ✅ | ✅ | ✅ |
| File paths (backslash) | ✅ | ❌ | ❌ |
| File paths (forward slash) | ✅ | ✅ | ✅ |
| Case-sensitive paths | ❌ | ✅ (default off) | ✅ |
| UTF-8 BOM handling | ⚠️ | ✅ | ✅ |

### Verdict
- Cross-platform design is good
- Use forward slashes in documentation
- Ensure scripts handle path separators generically
