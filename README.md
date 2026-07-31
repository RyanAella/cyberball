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
- **Player Customization**: Customize player color via color picker
- **Live Preview**: Phaser-based preview showing exact game appearance with selected settings

---

## How to Play

### Configuration Mode
1. Open `index.html` in your browser
2. Navigate between **Participant** and **CPU Settings** using the arrow button
3. Select number of CPU players (2 or 3)
4. Customize player color using the color picker (when Customize is enabled)
5. View the live preview to see player positions and colors
6. Click "Preview Game" to start playing

### Game Mode
1. **Start**: Player 0 (P1) begins with the ball at bottom center
2. **Throw**: Click on any other player to throw the ball
3. **Catch**: CPU players automatically catch and throw back
4. **Control**: Move your mouse to change Player 0's look direction when holding the ball
5. **Back to Config**: Click "Back to Configuration" to return to settings

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
