# Changelog

All notable changes to the Cyberball game.

## [0.2.0] – 2026-07-28

### Added
- Configuration builder with settings panel (CPU count: 2 or 3)
- Hybrid page: configuration mode (no URL params) and game mode (?cpus=N)
- Visual preview showing player positions before starting
- CyberballOS-style header with logo and title
- Back to Configuration button in game view

### Changed
- Player positions: P1 always at bottom center, CPUs arranged in cross formation
  - 2 CPUs: CPU 1 left center, CPU 2 right center
  - 3 CPUs: CPU 1 left center, CPU 2 top center (opposite P1), CPU 3 right center (opposite CPU 1)
- Settings panel shows only available options (removed Name, Customize, Leave Game Options)
- Logo size increased to 200x100px
- Title changed to "CyberballOS Configuration Builder"
- Preview and game use same player arrangement

### Fixed
- Preview now correctly displays selected number of CPUs
- Game initialization only starts when game container is visible

---

## [0.1.0] – 2026-07-28

### Added
- Basic ball catching and throwing mechanics
- Player look direction follows ball during flight
- CPU players with random target selection
- Project setup with Git, README, and CHANGELOG

### Changed
- Ball position logic: front of body when catching, behind when holding
- Player 0 (user-controlled) specific ball Y-offset for visual alignment
- Look direction behavior for all players

### Fixed
- Ball no longer passes through catcher
- Target player no longer turns away from thrower before catching
- Ball positioning during catch animation remains consistent
- CPU players no longer jitter when holding the ball

### Technical
- Cleaned up and translated all comments to English
- Optimized overlap detection
- Improved animation state management

---

## [Unreleased]
*[For future changes]*
