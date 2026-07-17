# Configuration Guide

## Configuration Sources

| Source | Priority | Environment |
|--------|----------|-------------|
| Environment variables | Highest | All |
| .env.{NODE_ENV}.local | High | Local development |
| .env.{NODE_ENV} | Medium | All |
| .env | Low | Default fallback |
| Default values | Lowest | Code defaults |

## Configuration Schema

Config validated against a JSON Schema at startup:

```typescript
interface AppConfig {
  nodeEnv: 'development' | 'staging' | 'production';
  port: number;                              // default: 3000
  host: string;                              // default: '0.0.0.0'
  
  database: {
    url: string;                             // Postgres connection
    pool: { min: number; max: number };      // default: { min: 2, max: 10 }
    ssl: boolean;                            // default: false
  };
  
  redis: {
    url: string;                             // Redis connection
    keyPrefix: string;                       // default: 'storynaram:'
  };
  
  storage: {
    endpoint: string;
    region: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
  };
  
  queue: {
    prefix: string;                          // default: 'storynaram:queue'
    defaultJobOptions: {
      attempts: number;                      // default: 3
      backoff: { type: string; delay: number };
    };
  };
  
  ai: {
    defaultModel: string;
    providers: Record<string, { apiKey: string; baseUrl: string }>;
  };
  
  logging: {
    level: string;                           // default: 'info'
    pretty: boolean;                         // default: false
  };
  
  telemetry: {
    enabled: boolean;                        // default: false
    exporter: string;                        // default: 'console'
  };
}
```

## Feature Flags

Feature flags are configuration-driven:

```typescript
interface FeatureFlags {
  workflowsEnabled: boolean;
  aiEnabled: boolean;
  pluginsEnabled: boolean;
  telemetryEnabled: boolean;
  cachingEnabled: boolean;
  schemaValidation: 'strict' | 'lenient' | 'none';
}
```

Loaded from:
1. Environment variables: `FEATURE_{FLAG}=true`
2. Feature flag service (future)
3. Default values in code

## Secrets Management

- Secrets never committed to repository
- Development: .env.local (gitignored)
- Production: Secret manager (AWS Secrets, Vault, etc.)
- References resolved at startup
- Rotated without application restart (future)
