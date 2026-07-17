# Logging Directory

## Purpose
The AI Logging Architecture. Defines how all AI operations are logged for audit, debugging, and improvement.

## Responsibility
Provides comprehensive logging for every AI operation â€” prompts sent, files retrieved, decisions made, validations performed, warnings generated, errors encountered, and performance metrics collected.

## Log Event Types
| Event | Description |
|-------|-------------|
| Request | AI request received |
| Retrieval | Knowledge retrieved |
| Context | Context built |
| Prompt | Prompt assembled |
| Generation | AI generation called |
| Response | Response received |
| Validation | Validation performed |
| Decision | AI decision recorded |
| Error | Error encountered |
| Warning | Warning generated |

## Log Format
`json
{
  "timestamp": "2026-07-17T12:00:00Z",
  "sessionId": "session_000001",
  "eventType": "generation",
  "agent": "chapter_writer",
  "context": {
    "model": "gpt-4",
    "tokens": 4096,
    "entities": ["hero_000001", "scene_000001"]
  },
  "result": {
    "success": true,
    "validationPassed": true,
    "duration": 2340
  }
}
`

## Input
- AI operations data

## Output
- Structured log entries
- Aggregated log metrics

## Dependencies
- All modules â€” all operations are logged
- monitoring/ â€” logs feed monitoring dashboards
- analytics/ â€” logs feed analytics
