# Changelog

All notable changes to the DataTable component system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Real-time state synchronization between URL params, table state, and UI components
- URL parameter removal on state clear (sets to `null` for proper removal)
- Server component refresh on state changes via `router.refresh()`
- DataTableSortingContext for sharing sorting state across nested components

### Changed
- State props now flow from `DataTable` → `DataTableToolbar` → child components
- Components consume live state props instead of polling `table.getState()`

### Fixed
- Sync loops prevented by removing local state dependencies from URL sync effect
- Removed unused `keysToRemove` array calculation

### Known Issues
- Potential double-fetch when URL parameters update (see ADR-0003)

---

## Format Guidelines

When adding new entries:

- **Added** - for new features
- **Changed** - for changes in existing functionality
- **Deprecated** - for soon-to-be removed features
- **Removed** - for now removed features
- **Fixed** - for any bug fixes
- **Security** - in case of vulnerabilities

Group changes by date (newest first) using `## [YYYY-MM-DD]` format, or use `[Unreleased]` for ongoing work.

