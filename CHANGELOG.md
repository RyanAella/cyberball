# Changelog

All notable changes to the Cyberball game.

## [Unreleased]

### Added
- Complete ball catching and throwing mechanics
- Player look direction follows ball during flight
- CPU players with random target selection

### Changed
- Ball position logic:
  - **Catch position**: Ball appears in front of the body (view direction side)
  - **Hold position**: Ball appears behind the body (opposite side of view direction)
- Player 0 (user-controlled) specific ball Y-offset for better visual alignment
- Look direction behavior:
  - Player 0 follows mouse only when holding the ball and not during catch animation
  - Target player maintains look direction toward thrower during ball flight
  - CPU players look at the ball when not holding it
- Ball movement: Velocity is stopped on catch to prevent bouncing

### Fixed
- Ball no longer passes through catcher
- Target player no longer turns away from thrower before catching
- Ball positioning during catch animation remains consistent
- CPU players no longer jitter when holding the ball

### Technical
- Cleaned up all comments (translated to English, removed redundant ones)
- Optimized overlap detection for ball catching
- Improved animation state management

---

## Format

This changelog follows a simplified format:
- **Added**: New features
- **Changed**: Modifications to existing functionality  
- **Fixed**: Bug fixes
- **Technical**: Code improvements and refactoring
