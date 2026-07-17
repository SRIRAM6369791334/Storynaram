# Runtime Architecture Diagrams

## 1. Monorepo Structure

```mermaid
graph TB
    subgraph "apps/"
        API[api/ - NestJS REST API]
        CLI[cli/ - CLI Tooling]
        WORKER[worker/ - Background Jobs]
    end

    subgraph "packages/"
        CORE[core/ - Domain Entities]
        RUNTIME[runtime/ - Engine Orchestration]
        REGISTRY[registry/ - Schema Registry]
        SCHEMAS[schemas/ - Compiled Schemas]
        VALIDATION[validation/ - Validation Engine]
        WORKFLOW[workflow/ - State Machine]
        AI[ai/ - AI Engine]
        STORAGE[storage/ - S3 Storage]
        PLUGIN_SDK[plugin-sdk/ - Plugin SDK]
        COMMON[common/ - Shared Utilities]
        CONFIG[config/ - Configuration]
        LOGGER[logger/ - Structured Logging]
        EVENTS[events/ - Event Bus]
        TELEMETRY[telemetry/ - OpenTelemetry]
        TESTING[testing/ - Test Utilities]
    end

    subgraph "plugins/"
        PLUGINS[plugins/ - Third-party]
    end

    subgraph "tools/"
        TOOLS[tools/ - Build & Dev]
    end

    API --> RUNTIME
    CLI --> RUNTIME
    WORKER --> RUNTIME

    RUNTIME --> CORE
    RUNTIME --> REGISTRY
    RUNTIME --> SCHEMAS
    RUNTIME --> VALIDATION
    RUNTIME --> WORKFLOW
    RUNTIME --> AI
    RUNTIME --> STORAGE

    REGISTRY --> CORE
    VALIDATION --> REGISTRY
    VALIDATION --> CORE
    WORKFLOW --> VALIDATION
    WORKFLOW --> REGISTRY
    AI --> VALIDATION
    AI --> REGISTRY

    COMMON --> CORE
    CONFIG --> COMMON
    LOGGER --> CONFIG
    EVENTS --> COMMON
    TELEMETRY --> CONFIG
    TELEMETRY --> LOGGER

    PLUGIN_SDK --> CORE
    PLUGIN_SDK --> EVENTS
    PLUGINS --> PLUGIN_SDK

    TESTING --> COMMON

    style API,CLI,WORKER fill:#e94560,color:#fff
    style CORE,RUNTIME fill:#1a1a2e,stroke:#e94560,color:#fff
    style PLUGIN_SDK fill:#533483,color:#fff
```

## 2. NestJS Module Graph

```mermaid
graph TB
    ROOT[AppModule] --> CORE_MOD[CoreModule]
    ROOT --> CONFIG_MOD[ConfigModule]
    ROOT --> LOGGER_MOD[LoggerModule]
    ROOT --> EVENT_MOD[EventModule]
    ROOT --> TELEMETRY_MOD[TelemetryModule]

    CORE_MOD --> REGISTRY_MOD[RegistryModule]
    CORE_MOD --> SCHEMA_MOD[SchemaModule]
    CORE_MOD --> VALIDATION_MOD[ValidationModule]
    CORE_MOD --> WORKFLOW_MOD[WorkflowModule]
    CORE_MOD --> AI_MOD[AIModule]
    CORE_MOD --> STORAGE_MOD[StorageModule]
    CORE_MOD --> PLUGIN_MOD[PluginModule]

    REGISTRY_MOD --> CONFIG_MOD
    SCHEMA_MOD --> REGISTRY_MOD
    VALIDATION_MOD --> SCHEMA_MOD
    VALIDATION_MOD --> REGISTRY_MOD
    WORKFLOW_MOD --> VALIDATION_MOD
    WORKFLOW_MOD --> REGISTRY_MOD
    AI_MOD --> VALIDATION_MOD
    AI_MOD --> REGISTRY_MOD

    PLUGIN_MOD --> CONFIG_MOD
    PLUGIN_MOD --> EVENT_MOD

    style ROOT fill:#e94560,color:#fff
    style CORE_MOD,RUNTIME_MOD fill:#1a1a2e,color:#fff
```

## 3. Package Dependency Graph

```mermaid
graph LR
    subgraph "Layer 0: Foundation"
        COMMON[common]
        CONFIG[config]
        LOGGER[logger]
    end

    subgraph "Layer 1: Core"
        CORE[core]
        EVENTS[events]
        TELEMETRY[telemetry]
    end

    subgraph "Layer 2: Infrastructure"
        REGISTRY[registry]
        SCHEMAS[schemas]
        STORAGE[storage]
    end

    subgraph "Layer 3: Engines"
        VALIDATION[validation]
        WORKFLOW[workflow]
        AI[ai]
    end

    subgraph "Layer 4: Extension"
        SDK[plugin-sdk]
    end

    subgraph "Layer 5: Orchestration"
        RUNTIME[runtime]
    end

    subgraph "Layer 6: Applications"
        API[api]
        CLI[cli]
        WORKER[worker]
    end

    CONFIG --> COMMON
    LOGGER --> CONFIG
    CORE --> COMMON
    EVENTS --> COMMON
    TELEMETRY --> CONFIG
    TELEMETRY --> LOGGER
    REGISTRY --> CORE
    REGISTRY --> EVENTS
    SCHEMAS --> COMMON
    STORAGE --> COMMON
    VALIDATION --> REGISTRY
    VALIDATION --> CORE
    WORKFLOW --> VALIDATION
    WORKFLOW --> REGISTRY
    AI --> VALIDATION
    AI --> REGISTRY
    SDK --> CORE
    SDK --> EVENTS
    RUNTIME --> CORE
    RUNTIME --> REGISTRY
    RUNTIME --> VALIDATION
    RUNTIME --> WORKFLOW
    RUNTIME --> AI
    RUNTIME --> STORAGE
    API --> RUNTIME
    CLI --> RUNTIME
    WORKER --> RUNTIME
```

## 4. Runtime Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Bootstrap
    
    state Bootstrap {
        [*] --> LoadConfig
        LoadConfig --> InitLogger
        InitLogger --> InitTelemetry
        InitTelemetry --> LoadRegistries
        LoadRegistries --> DiscoverPlugins
        DiscoverPlugins --> InitEngines
        InitEngines --> RegisterServices
        RegisterServices --> BindAPIs
        BindAPIs --> HealthCheck
    }
    
    Bootstrap --> Running: Health OK
    Bootstrap --> Failed: Health Fail
    
    Running --> Degraded: Plugin Crash
    Degraded --> Running: Plugin Restart
    Running --> ShuttingDown: SIGTERM / SIGINT
    
    state ShuttingDown {
        [*] --> DrainConnections
        DrainConnections --> CompleteWork
        CompleteWork --> PersistState
        PersistState --> ReleaseResources
    }
    
    ShuttingDown --> [*]: Done
    Failed --> [*]
```

## 5. Plugin Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Discovered: Filesystem Scan
    Discovered --> Validated: Manifest Check
    Validated --> Loaded: Module Import
    Loaded --> Initialized: onLoad()
    Initialized --> Activated: onActivate()
    
    Activated --> Running: Ready
    
    Running --> Deactivated: onDeactivate()
    Deactivated --> Unloaded: onUnload()
    Unloaded --> [*]: Destroyed
    
    Running --> Error: Plugin Exception
    Error --> Running: Recovered
    Error --> Unloaded: Fatal
    
    Activated --> Suspended: Permission Violation
    Suspended --> Activated: Permission Restored
```

## 6. Event Flow

```mermaid
flowchart LR
    PUBLISHER[Service] -->|publish| BUS[EventBus]
    BUS -->|route| HANDLER1[Subscriber 1]
    BUS -->|route| HANDLER2[Subscriber 2]
    BUS -->|route| HANDLER3[Subscriber 3]
    
    HANDLER1 -->|success| ACK[Acknowledge]
    HANDLER2 -->|failure| RETRY{Retry?}
    RETRY -->|Yes| HANDLER2
    RETRY -->|No| DLQ[Dead Letter Queue]
    HANDLER3 -->|success| ACK

    BUS --> STORE[Event Store]
    STORE --> REPLAY[Event Replay]
```

## 7. Configuration Flow

```mermaid
flowchart TB
    ENV[Environment Variables] --> LOADER[Config Loader]
    ENV_FILE[.env Files] --> LOADER
    DEFAULT[Default Values] --> LOADER
    
    LOADER --> VALIDATOR[Config Validator]
    VALIDATOR -->|AJV Schema| CHECKS{Valid?}
    CHECKS -->|Yes| CONFIG[RuntimeConfig]
    CHECKS -->|No| ERROR[Startup Error]
    
    CONFIG --> DISTRIBUTE[Distribute to Modules]
    
    subgraph "Consumers"
        CORE_MOD[CoreModule]
        DB_MOD[DatabaseModule]
        REDIS_MOD[RedisModule]
        AI_MOD[AIModule]
        LOG_MOD[LoggerModule]
    end
    
    DISTRIBUTE --> CORE_MOD
    DISTRIBUTE --> DB_MOD
    DISTRIBUTE --> REDIS_MOD
    DISTRIBUTE --> AI_MOD
    DISTRIBUTE --> LOG_MOD
```

## 8. Build Pipeline

```mermaid
graph LR
    SOURCE[Source Code] --> LINT{ESLint}
    LINT -->|Pass| TYPE{TypeScript}
    LINT -->|Fail| FIX[Fix]

    TYPE -->|Pass| TEST{Tests}
    TYPE -->|Fail| FIX2[Fix Types]

    TEST -->|Pass| BUILD[Build Packages]
    TEST -->|Fail| FIX3[Fix Tests]

    BUILD -->|Packages| DOCKER[Docker Build]
    BUILD -->|Docs| API_DOCS[OpenAPI Generation]

    DOCKER --> PUSH[Push to Registry]
    PUSH --> STAGING[Deploy Staging]

    STAGING -->|Smoke Tests| APPROVE{Approved?}
    APPROVE -->|Yes| PROD[Deploy Production]
    APPROVE -->|No| FIX4[Fix & Redeploy]

    style PROD fill:#1a1a2e,stroke:#e94560,color:#fff
```
