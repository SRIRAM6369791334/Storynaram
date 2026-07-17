# Metadata Type

## Purpose
Defines the standard metadata block type.

## Definition
`json
{
  "type": "object",
  "required": ["version", "status", "createdAt", "updatedAt"],
  "properties": {
    "version": { "type": "integer", "minimum": 1 },
    "status": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "createdBy": { "type": "string" },
    "updatedBy": { "type": "string" },
    "description": { "type": "string", "maxLength": 2000 },
    "tags": { "type": "array", "items": { "type": "string" } },
    "versionHistory": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "version": { "type": "integer" },
          "date": { "type": "string", "format": "date-time" },
          "change": { "type": "string" }
        }
      }
    }
  }
}
`

## Required Fields
- ersion â€” Integer, starts at 1
- status â€” One of the Status enum values
- createdAt â€” ISO 8601 UTC timestamp
- updatedAt â€” ISO 8601 UTC timestamp

## Optional Fields
- createdBy â€” Creator identifier
- updatedBy â€” Last modifier identifier
- description â€” Entity description
- 	ags â€” Tag array
- ersionHistory â€” Array of version records

## Usage
Present in every entity JSON as the metadata field:
`json
{
  "metadata": {
    "version": 1,
    "status": "draft",
    "createdAt": "2026-07-17T12:00:00Z",
    "updatedAt": "2026-07-17T12:00:00Z",
    "createdBy": "author",
    "tags": ["fantasy"]
  }
}
`
"@ | Set-Content -Path (Join-Path E:\Storynaram\core\types "Metadata.md") -Encoding UTF8

@"
# Coordinates Type

## Purpose
Defines the spatial coordinate type for geographical entities.

## Definition
`json
{
  "type": "object",
  "properties": {
    "latitude": { "type": "number", "minimum": -90, "maximum": 90 },
    "longitude": { "type": "number", "minimum": -180, "maximum": 180 },
    "elevation": { "type": "number", "description": "Elevation in meters" },
    "system": { "type": "string", "description": "Coordinate system identifier" }
  }
}
`

## Usage
`json
{
  "coordinates": {
    "latitude": 42.5,
    "longitude": -73.8,
    "elevation": 150
  }
}
`

## Validation
- Latitude: -90 to 90
- Longitude: -180 to 180
- Elevation: any real number (negative for below sea level)
