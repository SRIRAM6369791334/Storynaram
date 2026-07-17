# Module Guide — NestJS Architecture

## CoreModule

**Purpose:** Application bootstrap, global providers, lifecycle hooks.
**Responsibilities:**
- Global exception filter registration
- Global pipe registration
- Interceptor registration
- Application lifecycle event handling
- Dependency injection root configuration
**Dependencies:** ConfigModule, LoggerModule
**Extension points:** Lifecycle hooks, global interceptors

## RuntimeModule

**Purpose:** Runtime engine orchestration — the central coordinator.
**Responsibilities:**
- Engine initialization and shutdown
- Cross-engine coordination
- Registry loading on startup
- Health check aggregation
**Dependencies:** RegistryModule, SchemaModule, ValidationModule, WorkflowModule, AIModule, StorageModule
**Extension points:** Engine hooks, runtime events

## RegistryModule

**Purpose:** Schema registry service — the source of truth for all schema metadata.
**Responsibilities:**
- Load registry files at startup
- Cache schema references
- Resolve $ref chains
- Provide schema query API
**Public API:** `RegistryService` (getSchema, resolveRef, listSchemas, getDependencies)
**Dependencies:** ConfigModule, CacheModule
**Extension points:** Custom registry providers

## SchemaModule

**Purpose:** JSON Schema loading, compilation, and validation.
**Responsibilities:**
- Load JSON Schema files
- Compile schemas with AJV
- Validate documents against schemas
- Provide AJV instance with Draft 2020-12 support
**Public API:** `SchemaService` (validate, compile, getValidator, addSchema)
**Dependencies:** RegistryModule, ConfigModule
**Extension points:** Custom validation keywords, format validators

## ValidationModule

**Purpose:** Multi-layered validation engine — rules, constraints, business logic.
**Responsibilities:**
- Load validation profiles
- Execute validation rule sets
- Collect and aggregate results
- Report errors, warnings, scores
**Public API:** `ValidationService` (validate, getProfile, getRules)
**Dependencies:** SchemaModule, RegistryModule, CoreModule, EventsModule
**Extension points:** Custom rule definitions, custom validators

## WorkflowModule

**Purpose:** State machine orchestration engine.
**Responsibilities:**
- Load workflow definitions
- Execute state transitions
- Manage approval chains
- Handle retry, rollback, checkpoints
**Public API:** `WorkflowService` (execute, transition, getState, getHistory)
**Dependencies:** SchemaModule, RegistryModule, ValidationModule, EventsModule
**Extension points:** Custom transition guards, custom actions

## AIModule

**Purpose:** AI runtime orchestration — context, prompt, memory, reasoning.
**Responsibilities:**
- Build AI context from entity data
- Assemble prompts with context injection
- Manage memory (short/long-term)
- Execute reasoning steps
- Validate AI output
**Public API:** `AIService` (generate, reason, validate, getContext)
**Dependencies:** SchemaModule, RegistryModule, ValidationModule, EventsModule
**Extension points:** Model providers, custom strategies

## StorageModule

**Purpose:** Document and asset storage abstraction.
**Responsibilities:**
- S3-compatible put/get/delete
- URL generation
- Multipart upload support
- Bucket management
**Public API:** `StorageService` (upload, download, delete, getUrl)
**Dependencies:** ConfigModule
**Extension points:** Custom storage providers

## PluginModule

**Purpose:** Plugin discovery, loading, lifecycle management.
**Responsibilities:**
- Discover plugins from filesystem
- Load and validate plugin manifests
- Manage plugin lifecycle
- Enforce plugin sandbox and permissions
**Public API:** `PluginService` (load, unload, getPlugins, executeHook)
**Dependencies:** ConfigModule, LoggerModule, EventsModule
**Extension points:** Plugin SDK, hook system

## ConfigurationModule

**Purpose:** Configuration loading, validation, and distribution.
**Responsibilities:**
- Load env files and env vars
- Validate config against schema
- Provide typed config objects
- Support hot-reload for development
**Public API:** `ConfigService` (get, set, watch, validate)
**Dependencies:** None
**Extension points:** Custom config sources

## EventModule

**Purpose:** Domain and system event bus.
**Responsibilities:**
- Event publishing and subscribing
- Event serialization
- Event routing
- Dead letter handling
**Public API:** `EventBus` (publish, subscribe, unsubscribe)
**Dependencies:** CommonModule
**Extension points:** Custom event handlers

## TelemetryModule

**Purpose:** OpenTelemetry integration for observability.
**Responsibilities:**
- Distributed tracing setup
- Metrics collection
- Health check endpoints
- Span and metric instrumentation
**Public API:** `TelemetryService` (startSpan, recordMetric, recordError)
**Dependencies:** ConfigModule, LoggerModule
**Extension points:** Custom instrumentations
