# Timeline Directory

## Purpose
The master chronological ledger for every event in the story universe. Designed to scale to millions of events across multiple calendars and timelines.

## Responsibility
Manages all temporal data â€” event sequencing, calendar systems, era definitions, historical records, and future projections. Provides the authoritative answer to "when did X happen?" and "what happened at time Y?"

## Naming Convention
- **Subdirectories**: plural_lowercase (e.g., events/, eras/)
- **Files**: {entity_id}.json â€” one file per chronological entity
- **timeline.json**: Root timeline index file

## Directory Structure
| Subdirectory | Contents |
|-------------|----------|
| eras/ | Major era definitions â€” ages, epochs, periods |
| calendars/ | Calendar system definitions â€” lunar, solar, magical |
| events/ | Individual event records with date, location, participants |
| wars/ | War and conflict definitions with timelines |
| disasters/ | Natural and magical disaster records |
| evolutions/ | Revolution, coup, and uprising event definitions |
| discoveries/ | Discovery and invention event records |
| prophecies/ | Prophecy definitions with predicted and fulfillment dates |
| uture/ | Future events â€” planned timelines, foreshadowed events |
| history/ | Historical event archives |

## Future Expansion
- Event correlation engine
- Causal relationship mapping
- Parallel universe timeline branching
- Probability-weighted future timelines
- Time travel paradox tracking

## Relationships
- **Characters/** events reference timeline entries
- **World/** location changes over time are tracked via timeline
- **Plots/** plot events link to timeline events
- **Memory/** uses timeline for consistency checking
- **Books/** chapters reference timeline periods
