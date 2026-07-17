# @storynaram/worker

Background job worker for Storynaram using BullMQ and NestJS.

## Usage

```bash
pnpm --filter @storynaram/worker dev
```

## Configuration

| Variable       | Default                  | Description         |
|----------------|--------------------------|---------------------|
| `REDIS_URL`    | `redis://localhost:6379` | Redis connection    |
| `REDIS_PREFIX` | `storynaram`             | Redis key prefix    |
| `CONCURRENCY`  | `5`                      | Parallel jobs       |
| `QUEUE_NAME`   | `storynaram:queue`       | BullMQ queue name   |
