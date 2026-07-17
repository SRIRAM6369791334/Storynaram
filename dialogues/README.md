# Dialogues Directory

## Purpose
The dialogue management system. Every line of spoken (or otherwise communicated) dialogue across the entire story is defined and managed here.

## Responsibility
Manages all character speech â€” dialogue lines, conversations, speech patterns, subtext, and communication styles.

## Naming Convention
- **Files**: {book_id}_ch{chapter_num}_sc{scene_num}_dialog.json
- **IDs** follow config/id_rules.json
- **Structure**: Flat directory for cross-book query capability

## Contents
- Dialogue lines with speaker attribution
- Conversation sequences
- Dialogue tone and register
- Subtext and hidden meaning annotations
- Non-verbal communication (gestures, expressions)
- Internal monologue and thoughts
- Group conversations and dynamics
- Interruptions and overlapping speech
- Silence and pauses
- Language switching and translation notes

## Future Expansion
- Character voice consistency checker
- Dialogue generation assistant
- Conversation flow analysis
- Subtext detection and tracking
- Speech pattern analysis per character
- Dialogue-to-action ratio analysis

## Relationships
- **Scenes/** dialogues occur within scenes
- **Characters/** every line attributed to a character
- **Characters/personalities** dialogue reflects personality
- **Timeline/** dialogue temporal placement
- **Plots/** dialogue advances plot and reveals information
- **Languages/** dialogue may be in specific languages
