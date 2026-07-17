# Priority and Severity Enums

## Purpose
Defines priority and severity levels used across the system.

## Priority
| Value | Description |
|-------|-------------|
| critical | Must be addressed immediately |
| high | Must be addressed soon |
| medium | Should be addressed when possible |
| low | Can be deferred |
| none | No priority |

## Severity
| Value | Description |
|-------|-------------|
| critical | System-blocking issue |
| major | Significant issue |
| minor | Minor issue |
| cosmetic | Cosmetic issue only |
| info | Informational only |

## Validation Severity
| Value | Code | Description |
|-------|------|-------------|
| critical | CRIT | Must fix before any further operations |
| error | ERR | Must fix before finalization |
| warning | WARN | Should fix, non-blocking |
| info | INFO | Advisory, no action required |
