# BaseLocalization

## Purpose
Supports multi-language entities. Each entity has a primary locale and can carry translations in multiple locales.

## Required Fields
None (all optional, though `locale` has a default of "en")

## Optional Fields
- `locale` — primary locale of the entity
- `localizations` — array of translated content per locale
- `autoTranslate` — flag for auto-generation of translations
- `fallbackLocale` — locale to use when translation unavailable

## Inheritance Rules
- **Final**: `locale`
- **Overrideable**: `localizations`, `autoTranslate`, `fallbackLocale`
