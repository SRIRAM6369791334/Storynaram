# BaseLocalization

**File:** `BaseLocalization.schema.json`

**Purpose:** Multi-language localization block — translated fields per locale for every localizable entity with auto-translate support.

**Referenced Template:** `templates/base/BaseLocalization.template.json`

**Schema Version:** Draft 2020-12

**Required Fields:** none

**Key Constraints:** `locale` pattern `^[a-z]{2}(-[A-Z]{2})?$` (BCP 47). `localizations[].locale` must match same pattern. `machineTranslated` defaults to false. `autoTranslate` defaults to false. `localizations[].fields` is an object with string values and additional properties allowed.

**Validation Notes:** Primary `locale` is the source language. Each localization entry provides translated `title`, `description`, `summary`, and arbitrary `fields`.

**Backward Compatibility:** Adding new locales is additive. All sections are optional.
