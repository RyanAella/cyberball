# Cyberball

A simple Phaser 3 based ball passing game with configurable player setup. Features a configuration builder and playable game mode.

---

## Features

- **Ball Mechanics**: Throw and catch ball between players
- **Player Control**: Player 0 (user) follows mouse cursor when holding the ball
- **AI Players**: CPU players automatically throw to random targets
- **Look Direction**: Players face the ball during flight, target player faces thrower during catch
- **Visual Feedback**: Ball appears in front of body when catching, behind when holding
- **Configuration Builder**: Set number of CPU players (2 or 3) before starting the game
- **Hybrid Mode**: Seamless switch between configuration and game view
- **Player Customization**: Customize player color via color picker and player name via input field
- **Live Preview**: Phaser-based preview showing exact game appearance with selected settings (including player name)

---

## How to Play

### Configuration Mode
1. Open `index.html` in your browser
2. Navigate between **Participant** and **CPU Settings** using the arrow button
3. Select number of CPU players (2 or 3)
4. Customize player color using the color picker (when Customize is enabled)
5. Change Player 1 name in the input field
6. View the live preview to see player positions, colors, and names
7. Click "Preview Game" to start playing
8. Click "Copy Link" to share your configuration with others

### Game Mode
1. **Start**: Player 0 (P1) begins with the ball at bottom center, displayed with active animation
2. **Throw**: Click on any other player to throw the ball
3. **Catch**: CPU players automatically catch and throw back, displayed with idle animation
4. **Control**: Move your mouse to change Player 0's look direction when holding the ball

### Sharing Configurations
- Use "Copy Link" to generate a shareable URL with all your settings
- When a user opens the link, they see the configuration view with your settings pre-filled
- They can then click "Preview Game" to play with your settings
- Users cannot modify the configuration once in game view (no back button)

---

## Project Structure

```
cyberball/
├── index.html          # Game entry point
├── js/
│   └── game.js         # Main game logic
├── assets/
│   ├── ball.png        # Ball sprite
│   ├── player.json     # Player sprite atlas
│   └── player/         # Player animation frames
├── README.md           # This file
└── CHANGELOG.md        # Change history
```

---

## Setup

### Local Development
1. Clone or download the repository
2. Open `index.html` in a browser
3. No server required – runs client-side

### GitHub Pages Deployment
1. Push to a GitHub repository
2. Go to **Settings → Pages**
3. Select `main` branch and `/ (root)` folder
4. Your game will be live at `https://<username>.github.io/cyberball/`

---

## Requirements

- Modern browser with JavaScript enabled
- Internet connection (for Phaser CDN)

---

## Credits

- **Engine**: [Phaser 3](https://phaser.io/)
- **Development**: Mistral Vibe

---

## License

This project is open source. Feel free to use, modify, and distribute.
