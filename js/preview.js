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
        this.load.setBaseURL('assets/');
        this.load.image('ball', 'ball.png');
        this.load.multiatlas('player', 'player.json');

        // 🔥 Bild in preload laden, falls vorhanden
        if (this.config.bgType === 'image' && this.config.bgImageUrl && this.config.bgImageUrl.trim() !== '') {
            try {
                // Einzigartiger Key, um Caching zu vermeiden
                const textureKey = 'previewBg_' + Date.now();
                this.load.image(textureKey, this.config.bgImageUrl);
                // Speichere den Key für später
                this.currentTextureKey = textureKey;
            } catch (e) {
                console.error("Fehler beim Laden des Hintergrundbilds:", e);
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
            if (this.currentTextureKey && this.textures.exists(this.currentTextureKey)) {
                this.cameras.main.setBackgroundColor('#f5f5f5');
                if (this.backgroundImage) {
                    this.backgroundImage.destroy();
                }
                this.backgroundImage = this.add.image(250, 200, this.currentTextureKey);
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
        player0.play('active');

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

        // CPU Positionen (2 CPUs)
        const cpuPositions = [
            { x: 200 * scaleX, y: 300 * scaleY },
            { x: 600 * scaleX, y: 300 * scaleY }
        ];

        cpuPositions.forEach((pos, i) => {
            const cpu = this.add.sprite(pos.x, pos.y, 'player', 'idle/1.png');
            cpu.setScale(scaleX);
            cpu.play('idle');
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

        this.config = { ...this.config, ...config };

        if (bgChanged) {
            // Szene neu starten, um das neue Bild zu laden
            this.scene.restart({ config: this.config });
        } else {
            // Nur die Szene aktualisieren, wenn sich andere Dinge geändert haben
            this.updateScene();
        }
    }
};

// ========== PHASER PREVIEW GAME ==========
window.PhaserPreviewGame = class {
    constructor(container) {
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

        this.game.events.once('ready', () => {
            this.scene = this.game.scene.getScene('default');
            this.scene.init({ config: defaultConfig });
            this.isReady = true;

            if (this.pendingConfig) {
                this.scene.updateConfig(this.pendingConfig);
                this.pendingConfig = null;
            }
        });
    }

    updateConfig(config) {
        if (this.isReady && this.scene) {
            this.scene.updateConfig(config);
        } else {
            this.pendingConfig = config;
        }
    }

    destroy() {
        if (this.game) this.game.destroy(true);
    }
};