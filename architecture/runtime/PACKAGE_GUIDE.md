# Package Guide

## Package Conventions

Every `@storynaram/*` package follows this structure:

```
packages/{name}/
├── src/
│   ├── index.ts              # Public barrel export
│   ├── {name}.module.ts      # NestJS module (if applicable)
│   ├── interfaces/           # TypeScript interfaces
│   ├── services/             # Service implementations
│   ├── providers/            # Custom providers
│   ├── guards/               # NestJS guards (if applicable)
│   ├── pipes/                # NestJS pipes (if applicable)
│   ├── filters/              # Exception filters (if applicable)
│   ├── decorators/           # Custom decorators (if applicable)
│   └── utils/                # Internal utilities
├── test/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
└── README.md
```

## Package.json Conventions

```json
{
  "name": "@storynaram/{name}",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" }
  },
  "publishConfig": { "access": "restricted" }
}
```

## Shared Library Design

### @storynaram/common

Foundation utilities shared by all packages:
- Type definitions (DeepPartial, Nullable, AsyncReturnType, etc.)
- String utilities (ID generation, slug, case conversion)
- Date/time utilities
- Collection helpers
- Result/Option monad types
- Guard functions
- Branded types

### @storynaram/config

Typed configuration loaded from env:
```typescript
interface RuntimeConfig {
  port: number;
  nodeEnv: 'development' | 'staging' | 'production';
  database: PostgresConfig;
  redis: RedisConfig;
  storage: S3Config;
  queue: BullConfig;
  ai: AIConfig;
}
```

### @storynaram/logger

Conditional logger binding:
- Production: Pino structured JSON logger
- Development: Pino-pretty colored output
- Testing: Pino test/noop sink
- Correlation ID injection via AsyncLocalStorage

### @storynaram/events

Event bus interface:
```typescript
interface EventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(pattern: string, handler: EventHandler<T>): Promise<void>;
  unsubscribe(pattern: string, handler: EventHandler): Promise<void>;
}
```

### @storynaram/telemetry

OpenTelemetry wrapper:
- TracerProvider setup
- MeterProvider setup
- Auto-instrumentation for HTTP, gRPC, DB
- Manual span creation helpers
- Metric recording helpers
