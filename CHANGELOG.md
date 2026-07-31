# Changelog

All notable changes to the Cyberball game.

## [0.4.1] – 2026-07-31

### Added
- Customizable Player 1 name via input field in Participant settings
- Player name is reflected in both preview and game
- Copy Link and Preview Game buttons pass custom player name as `pname` parameter

### Fixed
- Form submission no longer reloads page when pressing Enter in name field
- Preview updates live when player name is changed

---

## [0.4.0] – 2026-07-31

### Fixed
- Navigation between Participant and CPU Settings works correctly
- CPU player name labels in preview no longer overlap when switching between 2/3 CPUs
- Modal title preserves help button when switching between settings

---

## [0.3.0] – 2026-07-31

### Added
- Phaser-based preview in configuration view (replaces CSS preview)
- Live preview updates when settings change (CPU count, background, player color)
- Player color customization via color picker
- Copy Link button to share configuration

### Changed
- Default player color changed from blue (#2196F3) to white (#FFFFFF)
- Preview now uses same rendering as the actual game (Phaser sprites)
- Player 0 displays with active animation and ball in preview
- CPU players display with idle animation in preview

### Removed
- Exit button from configuration view
- CSS-based preview (replaced with Phaser)

---

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
- Navigation between Participant and CPU Settings works correctly
- CPU player name labels in preview no longer overlap when switching between 2/3 CPUs

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
