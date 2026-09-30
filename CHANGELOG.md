# Changelog

All notable changes to the Cyberball game.

---

## [Unreleased]
### Added
- **Two game modes** – `inclusion` (participant plays along and receives balls) and `exclusion` (participant receives no balls), selectable via URL parameter `mode`
- **Custom CPU names** – Individual names for each CPU player, configurable in the builder (`cpuNames` URL parameter)
- **Avatar images above players** – Small images (photo/avatar) above each player, uploaded directly in the builder as image files. Images are compressed client-side (max 96×96 px, ~1–5 KB each) and embedded as Base64 in the game link – no server storage, no external image hosts, no CORS issues. The game loads them directly from the URL (`avatar0`, `avatars` parameters)
- **Game end with completion code** – Configurable number of throws (`throws`); at the end a randomly generated code (prefix via `codePrefix`) is displayed for verification in the online survey
- **Optional redirect to survey** – Automatic redirect to a survey URL after the game ends (`redirect` parameter, 5 seconds delay)
- **Throw counter** – Live display of throws played vs. total

### Fixed
- **Asset base path with `index.html` in URL** – Base URL no longer appends `/assets/` to `/index.html`, fixing 404s when opening the game via `index.html?...`
- **Background image now also via file upload** – Same Base64-in-link solution as avatars: client-side compression to max 800×600 px, no external image hosts, no CORS proxy; removed obsolete `convertToDirectImageUrl` helper (cors-anywhere dependency)

## [0.6.2] – 2026-09-01

### Added

- **Image URL converter for various image hosts** – Support for PostImage.cc, Pexels, and Imgur with automatic conversion to direct image URLs

### Fixed

- **404 errors for PostImage.cc URLs** – Fixed by converting to direct links via CORS proxy
- **Background image loading for various image hosting services** – Properly handles PostImage.cc, Pexels, and Imgur URLs
- **Copy Link now generates working URLs** – Correctly formats image paths and removes trailing slashes/Live Server parameters
- **Direct game start from URL parameters** – Automatically launches the game when parameters (e.g., `?cpus=2&bgType=color`) are present
- **Asset loading paths for subdirectories** – Fixed base path resolution for `/cyberball/` subfolder
- **Consistent URL handling** – Unified URL generation logic between "Copy Link" and "Preview Game" buttons

### Optimized

- **Modular helper functions** – Extracted reusable logic (e.g., `buildGameUrl()`, `getConfig()`)
- **Centralized DOM access** – Cached all DOM elements to minimize repeated lookups

---

## [0.6.1] – 2026-09-01

### Fixed
- **CPU settings now properly update preview and game** – Dynamically positions 2 or 3 CPU players based on selection
- **Background images display correctly in preview** – Fixed black background with green border issue
- **Old background images no longer persist** when switching to new URLs or colors
- **Preview updates immediately** when changing CPU count or background settings
- **Scene restart logic** – Properly reloads textures when background image URL changes

---

## [0.6.0] – 2026-08-31

### Added
- **Background customization**: Users can now set custom background images via URL parameter or direct input
- **Image URL field** in configuration settings for easy background image selection
- **Dynamic background loading**: Preview and game now support external image URLs (e.g., from Imgur, Pexels)
- **Live preview updates** for background changes (color and image)

### Changed
- Preview now uses Phaser's native image loading for better compatibility
- Default background color changed to `#f5f5f5` (light gray)
- Background images are scaled to fit the preview/game container

### Fixed
- Black background with green border issue when loading external images
- Old background images remaining visible when switching to new URLs
- Texture loading errors for external image URLs
- Preview not updating when background settings change

---

## [0.5.2] – 2026-08-21

### Fixed
- Player color now correctly resets to default (`#FFFFFF`) when Customize checkbox is unchecked
- Player color is only applied in preview and game when Customize is enabled

---

## [0.5.1] – 2026-07-31

### Fixed
- Syntax error in index.html that prevented player name customization from working
- Player name now properly updates in preview when changed

---

## [0.5.0] – 2026-07-31

### Added
- URL parameters pre-fill configuration form when page is opened with a shared link

### Removed
- Back to Configuration button from game view (users can only play with preset configuration)

---

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

### Added
- Phaser-based preview in configuration view (replaces CSS preview)
- Live preview updates when settings change (CPU count, background, player color)
- Player color customization via color picker
- Copy Link button to share configuration

### Changed
- Default player color changed from blue (`#2196F3`) to white (`#FFFFFF`)
- Preview now uses same rendering as the actual game (Phaser sprites)
- Player 0 displays with active animation and ball in preview
- CPU players display with idle animation in preview

### Removed
- Exit button from configuration view
- CSS-based preview (replaced with Phaser)

---

## [0.3.0] – 2026-07-31

### Added
- Configuration builder with settings panel (CPU count: 2 or 3)
- Hybrid page: configuration mode (no URL params) and game mode (`?cpus=N`)
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

## [0.2.0] – 2026-07-28

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