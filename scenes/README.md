# Scenes Directory

## Purpose
The scene management system. Every individual scene across all chapters and books is defined and managed here.

## Responsibility
Defines every scene â€” its purpose, characters, location, dialogue, action, and emotional beats. Scenes are the atomic narrative units of the story.

## Naming Convention
- **Files**: {book_id}_chapter_{number}_scene_{number}.json
- **IDs** follow config/id_rules.json
- **Structure**: Flat directory for cross-book query capability

## Contents
- Scene metadata (title, chapter reference, scene number)
- Setting and time of day
- Characters present
- POV character
- Scene goal and conflict
- Scene type (action, dialogue, exposition, etc.)
- Emotional arc within scene
- Key events and revelations
- Transitions in and out
- Tone and atmosphere
- Word count tracking

## Future Expansion
- Scene generation assistant
- Scene pacing analysis
- Scene relationship mapping
- Scene consistency validation
- Emotional arc visualization
- Scene-to-scene transition analysis

## Relationships
- **Chapters/** scenes belong to chapters
- **Locations/** each scene occurs at a specific location
- **Characters/** scenes track character presence
- **Dialogues/** scenes contain dialogue sequences
- **Timeline/** scenes have precise temporal placement
- **Plots/** scenes advance plot threads
- **Memory/** character knowledge updated per scene
