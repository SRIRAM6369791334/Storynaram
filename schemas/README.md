# Schemas Directory

## Purpose
The schema registry. Formal JSON Schema definitions for every entity type in the Story Operating System.

## Responsibility
Provides the structural contract for all data in the system â€” field types, required fields, validation rules, relationships, and constraints. Schemas enforce data integrity across the entire project.

## Naming Convention
- **Files**: {entity_type}.schema.json (e.g., character.schema.json, location.schema.json)
- **Structure**: Flat directory for universal access

## Contents
- JSON Schema for every entity type
- Field type definitions and constraints
- Required vs. optional field rules
- Relationship field schemas
- Enum and allowed value definitions
- Pattern and format validations
- Conditional validation rules
- Cross-entity reference schemas
- Array and nested object schemas

## Future Expansion
- Schema versioning and migration
- Schema-driven UI generation
- Automated validation pipeline
- Schema comparison and diff tools
- Multi-format schema export (JSON Schema, OpenAPI, GraphQL)
- Schema evolution tracking

## Relationships
- **Templates/** schemas define the structure templates follow
- **Config/** validation rules and constraints
- **Scripts/validation** schemas drive validation scripts
- **All directories** schemas define data contracts for all entities
- **Memory/consistency** consistency rules reference schemas
