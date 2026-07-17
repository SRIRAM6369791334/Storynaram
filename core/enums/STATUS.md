# Status Enum

## Purpose
Single source of truth for all status enumerations used across Storynaram entities. All other documents MUST reference this file rather than duplicating enum values.

## Entity Status (Common)
Standard lifecycle status for all entity types:

| Value | Description |
|-------|-------------|
| draft | Entity is in draft state, work in progress |
| review | Entity is under review |
| revised | Entity has been revised after review |
| final | Entity is finalized and approved |
| published | Entity is published (for books and exportable content) |
| archived | Entity is archived (historical record) |
| deprecated | Entity is deprecated (superseded by newer version) |

## Book Status
| Value | Description |
|-------|-------------|
| outline | Book is in outline phase |
| draft | First draft in progress |
| revision | Revisions in progress |
| beta | Beta reader review |
| editing | Final editing |
| ready | Ready for publication |
| published | Published |
| archived | Archived |

## Character Status
| Value | Description |
|-------|-------------|
| concept | Character concept phase |
| draft | Character traits drafted |
| developed | Full backstory developed |
| final | Complete and finalized |
| locked | Immutable canon |
| archived | Archived |

## Character Life Status
| Value | Description |
|-------|-------------|
| alive | Character is living |
| dead | Character is deceased |
| undead | Character is undead |
| immortal | Cannot die naturally |
| missing | Whereabouts unknown |
| unknown | Status uncertain |

## World Status
| Value | Description |
|-------|-------------|
| draft | Initial geography concepts |
| development | Building locations and cultures |
| final | World complete |
| frozen | Locked for series canon |
| archived | Historical record |

## Organization Status
| Value | Description |
|-------|-------------|
| concept | Organization being planned |
| active | Organization is operational |
| inactive | Organization is dormant |
| defunct | Organization has dissolved |
| exiled | Organization is in exile |
| secret | Organization operates in secret |
| archived | Historical record |

## Magic Status
| Value | Description |
|-------|-------------|
| draft | Magic system being designed |
| active | Magic system is active |
| restricted | Magic is restricted or forbidden |
| lost | Magic knowledge is lost |
| archived | Historical record |

## Item Status
| Value | Description |
|-------|-------------|
| draft | Item being designed |
| available | Item exists in the world |
| owned | Item is owned by a character |
| consumed | Item has been consumed |
| destroyed | Item has been destroyed |
| archived | Historical record |

## Scene Status
| Value | Description |
|-------|-------------|
| planned | Scene is outlined |
| written | First draft written |
| revised | Scene has been revised |
| polished | Scene is ready for review |
| final | Scene is approved |
| removed | Scene has been removed |

## Event Status
| Value | Description |
|-------|-------------|
| proposed | Event has been suggested |
| planned | Event is scheduled |
| occurring | Event is in progress |
| resolved | Event has completed |
| canon | Event is confirmed canon |
| discarded | Event was rejected or canceled |
| revised | Event was retconned |

## Validation Status
| Value | Description |
|-------|-------------|
| pass | Validation passed |
| fail | Validation failed |
| warning | Validation passed with warnings |
| error | Validation encountered an error |
| skipped | Validation was skipped |

## Technology Status
| Value | Description |
|-------|-------------|
| concept | Technology being conceived |
| prototype | Working prototype exists |
| production | In active production use |
| obsolete | Superseded by newer technology |
| archived | Historical record |

## Technology Tier
| Value | Description |
|-------|-------------|
| primitive | Stone age / bronze age |
| medieval | Medieval technology |
| renaissance | Renaissance level |
| industrial | Industrial revolution |
| modern | Contemporary technology |
| futuristic | Advanced future technology |
| magical | Magic-based technology |
