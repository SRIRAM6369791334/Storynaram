# BaseAttachment

## Purpose
Manages file and asset attachments. Supports images, audio, video, documents, archives, 3D models, and custom types.

## Required Fields
None (all optional)

## Optional Fields
- `attachments` — array of file attachment objects
- `coverImage` — primary cover/thumbnail URL
- `gallery` — ordered gallery image URLs

## Inheritance Rules
- **Final**: none
- **Overrideable**: `attachments`, `coverImage`, `gallery`
