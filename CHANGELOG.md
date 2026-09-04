# ✨ Changelog (`v4.12.1`)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version Info

```text
This version -------- v4.12.1
Previous version ---- v4.12.0
Initial version ----- v4.5.7
Total commits ------- 1
```

## [v4.12.1] - 2026-09-04

### :arrows_counterclockwise: Changed

- Fixed modifyCandidacy to locate candidates by ID instead of index, preventing data corruption when editing candidates (wrong candidate was being overwritten) (VE-1975)
- Fixed preCumulate positioning for Proporz elections: cloned candidate now appears immediately after the original instead of at the list end
- Candidate numbering now skips the duplicate row of cumulated candidates (only unique candidates receive sequential numbers)

## [v4.12.0] - 2026-07-22

### 🆕 Added

- support custom header color

## [v4.11.1] - 2026-07-10

### 🔄 Changed

- update voting lib

## [v4.11.0] - 2026-06-17

### 🆕 Added

- add country to candidates

## [v4.10.0] - 2026-06-10

### 🆕 Added

- show email column in admin page

## [v4.9.3] - 2026-05-06

### 🔄 Changed

- change sg theme to schalter-e

## [v4.9.2] - 2026-04-15

### 🔄 Changed

- correctly display comments again

## [v4.9.1] - 2026-04-15

### 🔄 Changed

- update dependencies

## [v4.9.0] - 2026-03-27

### 🔄 Changed

- update angular 21 and base-components

Updated to angular 21
Updated base-components (table changes and color changes)
Improved some components (icon color for trash icons, and some paddings)

## [v4.8.1] - 2026-03-04

### 🔄 Changed

- do not show next candidacy button in majority elections with one seat

## [v4.8.0] - 2026-03-04

### 🔄 Changed

- require at least one candidate per list

## [v4.7.1] - 2026-03-04

### 🔄 Changed

- disable drag drop on locked lists

## [v4.7.0] - 2026-03-04

### 🔄 Changed

- remove candidate number in majority elections

## [v4.6.4] - 2026-02-26

### 🔄 Changed

- refactor candidate overview to fix multiple bugs

## [v4.6.3] - 2026-02-25

### 🔄 Changed

- improve archive

## [v4.6.2] - 2026-02-06

### 🔄 Changed

- extend CD pipeline with enhanced bug bounty publication workflow

## [v4.6.1] - 2026-01-20

### 🔄 Changed

- correctly unset the clone index of candidates

## [v4.6.0] - 2026-01-19

### 🆕 Added

- view archived elections

## [v4.5.11] - 2025-12-11

### 🔄 Changed

- update voting lib dependency

## [v4.5.10] - 2025-11-20

### 🔄 Changed

- update base components and angular lib

## [v4.5.9] - 2025-10-31

### 🔄 Changed

- apply election submission deadline policy for lists

## [v4.5.8] - 2025-10-22

### 🔄 Changed

- angular and base components update

## [v4.5.7] - 2025-10-02

### 🎉 Initial release for Bug Bounty
