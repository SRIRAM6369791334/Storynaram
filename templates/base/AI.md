# BaseAI

## Purpose
Configures AI-level behavior for every entity. Controls visibility to AI, embedding generation, retrieval weighting, canonical importance, and prompt overrides.

## Required Fields
None (all optional)

## Optional Fields
- `visibility` — AI visibility (visible, hidden, summary-only, embedding-only)
- `embedding` — embedding model, dimensions, fields, vector cache
- `retrieval` — context priority, weight, max context length, truncation
- `canon` — canonical importance, lock, source, last verification
- `keywords` — AI-optimized weighted keywords
- `notes` — AI-generated annotations
- `promptOverrides` — system/user prompt customizations

## Inheritance Rules
- **Final**: `visibility`, `canon.importance`, `canon.locked`
- **Overrideable**: `embedding`, `retrieval`, `keywords`, `notes`, `promptOverrides`
