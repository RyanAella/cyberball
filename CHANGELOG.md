# Changelog

All notable changes to the Cyberball game.

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
