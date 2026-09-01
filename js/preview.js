// ========== PHASER PREVIEW SCENE ==========
window.PhaserPreviewScene = class extends Phaser.Scene {
    init(data) {
        this.config = data?.config || {
            cpuCount: 2,
            bgType: 'color',
            bgColor: '#f5f5f5',
            bgImageUrl: '',
            playerColor: '#FFFFFF',
            playerName: 'Player 1'
        };
        this.players = [];
        this.ball = null;
        this.texts = [];
        this.backgroundImage = null;
        this.currentBgUrl = null;
    }

    preload() {
        // Construct correct base path for assets
        const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        this.load.setBaseURL(basePath + 'assets/');
        this.load.image('ball', 'ball.png');
        this.load.multiatlas('player', 'player.json');

        // Load background image if URL is provided
        if (this.config.bgType === 'image' && this.config.bgImageUrl && this.config.bgImageUrl.trim() !== '') {
            try {
                const oldBaseURL = this.load.baseURL;
                this.load.setBaseURL('');
                this.load.image('previewBg', this.config.bgImageUrl);
                this.load.setBaseURL(oldBaseURL);
            } catch (e) {
                console.error("Error loading background image:", e);
            }
        }
    }

    create() {
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('player', {
                start: 1, end: 1, prefix: 'idle/', suffix: '.png'
            })
        });
        this.anims.create({
            key: 'active',
            frames: this.anims.generateFrameNames('player', {
                start: 1, end: 1, prefix: 'active/', suffix: '.png'
            })
        });

        this.updateScene();
    }

    updateScene() {
        // Alte Elemente bereinigen
        this.players?.forEach(p => p.destroy());
        this.texts?.forEach(t => t.destroy());
        if (this.ball) { this.ball.destroy(); this.ball = null; }
        this.players = [];
        this.texts = [];

        // --- HINTERGRUND ---
        if (this.config.bgType === 'color') {
            this.cameras.main.setBackgroundColor(this.config.bgColor);
            if (this.backgroundImage) {
                this.backgroundImage.destroy();
                this.backgroundImage = null;
            }
        } else if (this.config.bgType === 'image' && this.config.bgImageUrl.trim() !== '') {
            // Bild anzeigen, falls in preload geladen
            if (this.textures.exists('previewBg')) {
                this.cameras.main.setBackgroundColor('#f5f5f5');
                if (this.backgroundImage) {
                    this.backgroundImage.destroy();
                }
                this.backgroundImage = this.add.image(250, 200, 'previewBg');
                this.backgroundImage.setDisplaySize(500, 400);
                this.backgroundImage.setDepth(-100);
                this.backgroundImage.setOrigin(0.5, 0.5);
            } else {
                // Fallback, falls Bild nicht geladen wurde
                this.cameras.main.setBackgroundColor('#888888');
            }
        } else {
            this.cameras.main.setBackgroundColor('#f5f5f5');
            if (this.backgroundImage) {
                this.backgroundImage.destroy();
                this.backgroundImage = null;
            }
        }

        // --- SPIELER UND BALL ---
        const scaleX = 500 / 800;
        const scaleY = 400 / 600;
        const player0X = 400 * scaleX;
        const player0Y = 500 * scaleY;

        const player0 = this.add.sprite(player0X, player0Y, 'player', 'active/1.png');
        player0.setScale(scaleX);
        if (this.anims.exists('active')) {
            player0.play('active');
        }

        // Apply player color tint
        const actualColor = this.config.playerColor || '#FFFFFF';
        const colorHex = actualColor.startsWith('#') ? actualColor.slice(1) : actualColor;
        const tint = parseInt(colorHex, 16);
        player0.setTint(tint);
        this.players.push(player0);

        const playerName = this.config.playerName || 'Player 1';
        const nameText = this.add.text(player0X, player0Y + 50 * scaleY, playerName, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#000000'
        }).setOrigin(0.5);
        this.texts.push(nameText);

        this.ball = this.add.sprite(player0X - 25, player0Y - 16.67, 'ball');
        this.ball.setScale(scaleX);

        // Dynamic CPU positions based on cpuCount
        let cpuPositions;
        if (this.config.cpuCount === 2) {
            cpuPositions = [
                { x: 200 * scaleX, y: 300 * scaleY },
                { x: 600 * scaleX, y: 300 * scaleY }
            ];
        } else if (this.config.cpuCount === 3) {
            cpuPositions = [
                { x: 200 * scaleX, y: 300 * scaleY },
                { x: 400 * scaleX, y: 100 * scaleY },
                { x: 600 * scaleX, y: 300 * scaleY }
            ];
        } else {
            cpuPositions = [
                { x: 200 * scaleX, y: 300 * scaleY },
                { x: 600 * scaleX, y: 300 * scaleY }
            ];
        }

        cpuPositions.forEach((pos, i) => {
            const cpu = this.add.sprite(pos.x, pos.y, 'player', 'idle/1.png');
            cpu.setScale(scaleX);
            if (this.anims.exists('idle')) {
                cpu.play('idle');
            }
            this.players.push(cpu);
            const cpuText = this.add.text(pos.x, pos.y + 50 * scaleY, `CPU ${i + 1}`, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#000000'
            }).setOrigin(0.5);
            this.texts.push(cpuText);
        });
    }

    updateConfig(config) {
        // Prüfe, ob sich die Bild-URL oder der Typ geändert hat
        const bgChanged = config.bgImageUrl !== this.config.bgImageUrl || config.bgType !== this.config.bgType;
        const cpuChanged = config.cpuCount !== this.config.cpuCount;

        this.config = { ...this.config, ...config };

        // Szene neu starten, wenn sich Hintergrund oder CPU-Anzahl geändert hat
        if (bgChanged || cpuChanged) {
            this.scene.restart({ config: this.config });
        } else {
            // Nur die Szene aktualisieren, wenn sich andere Dinge geändert haben
            this.updateScene();
        }
    }
};

// ========== PHASER PREVIEW GAME ==========
// Manages the Phaser game instance for the preview
window.PhaserPreviewGame = class {
    constructor(container) {
        // Default configuration
        const defaultConfig = {
            cpuCount: 2,
            bgType: 'color',
            bgColor: '#f5f5f5',
            bgImageUrl: '',
            playerColor: '#FFFFFF',
            playerName: 'Player 1'
        };

        this.pendingConfig = null;
        this.isReady = false;

        // Create Phaser game instance
        this.game = new Phaser.Game({
            type: Phaser.WEBGL,
            width: 500,
            height: 400,
            backgroundColor: '#f5f5f5',
            physics: {
                default: 'arcade',
                arcade: { gravity: { y: 0 }, debug: false }
            },
            parent: container,
            scene: [window.PhaserPreviewScene],
            audio: { noAudio: true }
        });

        // Wait for game to be ready before using the scene
        this.game.events.once('ready', () => {
            this.scene = this.game.scene.getScene('default');
            this.scene.init({ config: defaultConfig });
            this.isReady = true;

            // Apply any pending configuration
            if (this.pendingConfig) {
                this.scene.updateConfig(this.pendingConfig);
                this.pendingConfig = null;
            }
        });
    }

    // Update configuration
    updateConfig(config) {
        if (this.isReady && this.scene) {
            this.scene.updateConfig(config);
        } else {
            // Store config until scene is ready
            this.pendingConfig = config;
        }
    }

    // Clean up game instance
    destroy() {
        if (this.game) this.game.destroy(true);
    }
};

// Helper function to convert various image host URLs to direct image URLs
function convertToDirectImageUrl(url) {
    if (!url) return '';

    // Imgur - already direct
    if (url.includes('imgur.com')) {
        return url;
    }
    // PostImage.cc - add CORS proxy for external images
    else if (url.includes('postimg.cc')) {
        // Use a CORS proxy for PostImage.cc
        return `https://cors-anywhere.herokuapp.com/${url.replace('/B6c6', '/direct').replace('/b6c6', '/direct')}`;
    }
    // Pexels
    else if (url.includes('pexels.com')) {
        const match = url.match(/photos\/(\d+)\//);
        if (match) {
            const photoId = match[1];
            return `https://cors-anywhere.herokuapp.com/https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`;
        }
    }
    // Default - return as is
    return url;
}