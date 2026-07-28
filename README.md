# Cyberball

A simple Phaser 3 based ball passing game where players throw and catch a ball.

---

## Features

- **Ball Mechanics**: Throw and catch ball between players
- **Player Control**: Player 0 (user) follows mouse cursor when holding the ball
- **AI Players**: CPU players automatically throw to random targets
- **Look Direction**: Players face the ball during flight, target player faces thrower during catch
- **Visual Feedback**: Ball appears in front of body when catching, behind when holding

---

## How to Play

1. **Start**: Player 0 begins with the ball
2. **Throw**: Click on any other player to throw the ball
3. **Catch**: CPU players automatically catch and throw back
4. **Control**: Move your mouse to change Player 0's look direction when holding the ball

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
