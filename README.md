# Cyberball

A simple Phaser 3 based ball passing game with configurable player setup and customizable backgrounds.
Features a configuration builder, live preview, and playable game mode.

---

## Features

- **Ball Mechanics**: Throw and catch ball between players
- **Player Control**: Player 0 (user) follows mouse cursor when holding the ball
- **AI Players**: CPU players automatically throw to random targets
- **Look Direction**: Players face the ball during flight, target player faces thrower during catch
- **Visual Feedback**: Ball appears in front of body when catching, behind when holding
- **Configuration Builder**: Set number of CPU players (2 or 3) before starting the game
- **Background Customization**:
    - Choose between **color** or **image** background
    - Direct image URL input (supports external hosts like Imgur, Pexels)
    - Live preview of background changes
- **Player Customization**:
    - Customizable player color via color picker
    - Customizable Player 1 name
- **Live Preview**: Phaser-based preview showing exact game appearance with selected settings (including player name, background)
- **Shareable Configurations**: Generate URLs to share your setup with others

---

## How to Play

### Configuration Mode
1. Open `index.html` in your browser
2. Navigate between **Participant** and **Settings** using the arrow button
3. **CPU Settings**:
    - Select number of CPU players (2 or 3)
4. **Background Settings**:
    - Choose **Color** and pick a color, **OR**
    - Choose **Image URL** and enter a direct image link (e.g., from [Imgur](https://imgur.com/))
5. **Participant Settings**:
    - Enable **Customize** to change player color
    - Change **Player 1 name** in the input field
6. View the **live preview** to see player positions, colors, names, and background
7. Click **"Copy Link"** to share your configuration
8. Click **"Preview Game"** to start playing with your settings

### Game Mode
1. **Start**: Player 0 (P1) begins with the ball at bottom center, displayed with active animation
2. **Throw**: Click on any other player to throw the ball
3. **Catch**: CPU players automatically catch and throw back, displayed with idle animation
4. **Control**: Move your mouse to change Player 0's look direction when holding the ball

### Sharing Configurations
- Use **"Copy Link"** to generate a shareable URL with all your settings:
    - `cpus`: Number of CPU players (2 or 3)
    - `bgType`: Background type (`color` or `image`)
    - `bg`: Background value (color hex code or image URL)
    - `playerColor`: Player color (hex code, only if Customize is enabled)
    - `pname`: Player 1 name (only if not "Player 1")
- Example URL:
```
https://your-domain.com/cyberball/?cpus=2&bgType=image&bg=https%3A%2F%2Fi.imgur.com%2Fexample.jpg&playerColor=%23FF0000&pname=Max
```

- When a user opens the link, they see the **configuration view** with your settings pre-filled
- They can then click **"Preview Game"** to play with your settings

---

## Project Structure

```
cyberball/
├── index.html              # Main entry point
├── js/
│   ├── game.js             # Main game logic
│   └── preview.js          # Preview scene logic
├── assets/
│   ├── ball.png            # Ball sprite
│   ├── player.png          # Player sprite (fallback)
│   ├── player.json         # Player sprite atlas
│   └── player/             # Player animation frames
├── README.md               # This file
└── CHANGELOG.md            # Change history
```

---

## Setup

### Local Development
1. Clone or download the repository
2. Open `index.html` in a modern browser
3. No server required – runs client-side

### GitHub Pages Deployment
1. Push to a GitHub repository
2. Go to **Settings → Pages**
3. Select `main` branch and `/ (root)` folder
4. Your game will be live at `https://<username>.github.io/cyberball/`

---

## Requirements

- Modern browser with JavaScript enabled (Chrome, Firefox, Edge, Safari)
- Internet connection (for Phaser CDN)

---

## Background Image Tips

For best results with background images:
1. **Use direct image URLs** (not HTML pages):
    - ✅ Good: `https://i.imgur.com/XYZ.jpg`
    - ❌ Bad: `https://www.pexels.com/photo/...` (HTML page, not image)
2. **Recommended hosts**:
    - [Imgur](https://imgur.com/) (direct links work perfectly)
    - [Unsplash](https://unsplash.com/) (use "Download" → copy link)
    - Any CDN or static file host
3. **Image size**: 800x600px or larger for best fit
4. **CORS**: Some hosts may block external loading. Use CORS-enabled hosts like Imgur.

---

## Troubleshooting

### Background Image Not Loading
- **Problem**: Image appears as black with green border
- **Solution**:
    1. Use a **direct image URL** (not an HTML page)
    2. Check the browser console for CORS errors
    3. Try a different image host (e.g., Imgur)

### Preview Not Updating
- **Problem**: Changes to settings don't appear in preview
- **Solution**:
    1. Ensure `preview.js` is loaded after `game.js`
    2. Check browser console for errors
    3. Clear browser cache

### Game Not Starting
- **Problem**: Clicking "Preview Game" does nothing
- **Solution**:
    1. Ensure URL contains `?cpus=2` or `?cpus=3`
    2. Check that `game.js` is loaded correctly
    3. Verify Phaser CDN is accessible

---
