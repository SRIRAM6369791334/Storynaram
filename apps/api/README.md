# @storynaram/api

Main API server for the Storynaram platform.

Built with NestJS 11, strict TypeScript, and production patterns.

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Start in watch mode          |
| `pnpm build`     | Build for production         |
| `pnpm start`     | Start production server      |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test`      | Run unit tests               |
| `pnpm test:e2e`  | Run end-to-end tests         |

## API Endpoints

- `GET /api/v1` — Service info
- `GET /api/v1/health` — Health check
- `GET /docs` — Swagger UI
