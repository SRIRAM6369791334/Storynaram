# Logs Directory

## Purpose
The operational logging system. All logs recording system activity, script execution, AI operations, and project events.

## Responsibility
Provides an audit trail for all system operations â€” who did what, when, and with what result. Essential for debugging, auditing, and understanding system behavior.

## Naming Convention
- **Files**: {log_type}_{YYYYMMDD}.log or {log_type}_{YYYYMMDD}.json
- **Structure**: Flat or date-based subdirectories (e.g., 2026/, 2026/07/)
- **Format**: Plain text logs or structured JSON logs

## Contents
- Script execution logs
- Validation run logs
- Generator operation logs
- Import/export operation logs
- AI interaction logs
- Error and warning logs
- Performance logs
- User action audit logs
- System health logs
- Backup operation logs
- Migration logs

## Future Expansion
- Log level configuration (debug, info, warn, error)
- Log aggregation and analysis
- Log search and filtering
- Log retention policies
- Automated log rotation
- Alert system integration
- Log visualization dashboard

## Relationships
- **Scripts/** all script execution is logged
- **Memory/decisions** decision records complement logs
- **Backups/** backup operations logged
- **Exports/** export operations logged
- **Archive/** logs eventually archived
- **Config/** logging configuration
