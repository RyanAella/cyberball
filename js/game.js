// ========== PHASER CONFIGURATION ==========
window.getGameConfig = function getGameConfig() {
    const gameContainer = document.getElementById('game-container');
    return {
        type: Phaser.AUTO,
        width: gameContainer ? gameContainer.clientWidth : 800,
        height: gameContainer ? gameContainer.clientHeight : 600,
        backgroundColor: '#ffffff',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        parent: 'game-container'
    };
}

// ========== GAME SCENE CLASS ==========
window.GameScene = class GameScene extends Phaser.Scene {
    preload() {
        // 1. Lokale Assets laden (ball, player)
        this.load.setBaseURL('assets/');
        this.load.image('ball', 'ball.png');
        this.load.multiatlas('player', 'player.json');

        // 2. Hintergrundbild laden (absolute URL?)
        const bgUrlParams = new URLSearchParams(window.location.search);
        const bgType = bgUrlParams.get('bgType');
        const bgValue = bgUrlParams.get('bg');

        if (bgType === 'image' && bgValue) {
            const imageUrl = decodeURIComponent(bgValue);

            // ✅ BaseURL kurz zurücksetzen für absolute URLs
            const oldBaseURL = this.load.baseURL;
            this.load.setBaseURL('');  // Leer = absolute URLs erlaubt
            this.load.image('background', imageUrl);
            this.load.setBaseURL(oldBaseURL);  // Zurücksetzen für andere Assets
        }
    }

    create() {
        this.isCatching = false;

        // Background
        const bgUrlParams = new URLSearchParams(window.location.search);
        const bgType = bgUrlParams.get('bgType') || 'color';
        const bgValue = bgUrlParams.get('bg') || '#f5f5f5';

        if (bgType === 'color') {
            this.cameras.main.setBackgroundColor(bgValue);
        } else if (bgType === 'image' && bgValue) {
            const bg = this.add.image(400, 300, 'background');
            bg.setDisplaySize(800, 600);
            bg.setDepth(-100);
            bg.setOrigin(0.5, 0.5);
        } else {
            this.cameras.main.setBackgroundColor('#f5f5f5');
        }

        // Players
        const cpuCount = window.cyberballConfig?.cpuCount || 2;
        const urlParams = new URLSearchParams(window.location.search);
        const playerColor = urlParams.get('playerColor') || window.cyberballConfig?.playerColor || '#FFFFFF';
        const playerName = urlParams.get('pname') || window.cyberballConfig?.playerName || 'Player 1';

        const playerTint = playerColor.startsWith('#') ?
            parseInt(playerColor.slice(1), 16) :
            parseInt(playerColor, 16);

        this.players = [
            this.physics.add.sprite(400, 500, 'player', 'active/1.png')
        ];
        this.players[0].setTint(playerTint);

        let cpuPositions;
        if (cpuCount === 2) {
            cpuPositions = [{ x: 200, y: 300 }, { x: 600, y: 300 }];
        } else if (cpuCount === 3) {
            cpuPositions = [{ x: 200, y: 300 }, { x: 400, y: 100 }, { x: 600, y: 300 }];
        } else {
            cpuPositions = [{ x: 200, y: 300 }, { x: 600, y: 300 }];
        }

        for (let i = 0; i < cpuCount; i++) {
            this.players.push(
                this.physics.add.sprite(cpuPositions[i].x, cpuPositions[i].y, 'player', 'idle/1.png')
            );
        }

        this.players.forEach(player => {
            player.setScale(1);
            player.setImmovable(true);
            player.setCollideWorldBounds(true);
            player.setInteractive();
        });

        const playerNames = [playerName, ...Array.from({length: cpuCount}, (_, i) => `CPU ${i + 1}`)];
        this.players.forEach((player, index) => {
            this.add.text(
                player.x,
                player.y + 50,
                playerNames[index],
                { fontFamily: 'Arial', fontSize: '16px', color: '#000000' }
            ).setOrigin(0.5);
        });

        // Animations
        this.anims.create({
            key: 'active',
            frames: this.anims.generateFrameNames('player', { start: 1, end: 1, prefix: 'active/', suffix: '.png' })
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('player', { start: 1, end: 1, prefix: 'idle/', suffix: '.png' })
        });
        this.anims.create({
            key: 'throw',
            frameRate: 12,
            frames: this.anims.generateFrameNames('player', { start: 1, end: 3, prefix: 'throw/', suffix: '.png' })
        });
        this.anims.create({
            key: 'catch',
            frames: this.anims.generateFrameNames('player', { start: 1, end: 1, prefix: 'catch/', suffix: '.png' }),
            duration: 500,
            repeat: 0
        });

        this.players.forEach(player => {
            player.on('animationcomplete', () => {
                const animKey = player.anims.currentAnim.key;
                const playerIndex = this.players.indexOf(player);
                if (animKey === 'throw') player.play('idle');
                else if (animKey === 'catch' && playerIndex === this.currentHolder) player.play('active');
            });
        });

        // Ball Logic
        this.getHandPosition = function(player) {
            const handOffsetX = player.flipX ? 40 : -40;
            const handOffsetY = -25;
            return { x: player.x + handOffsetX, y: player.y + handOffsetY };
        };

        this.getCatchPosition = function(player) {
            const playerIndex = this.players.indexOf(player);
            const handOffsetX = player.flipX ? -50 : 50;
            const handOffsetY = (playerIndex === 0) ? -10 : -8;
            return { x: player.x + handOffsetX, y: player.y + handOffsetY };
        };

        this.getThrowPosition = function(player) {
            const handOffsetX = player.flipX ? -25 : 25;
            const handOffsetY = -25;
            return { x: player.x + handOffsetX, y: player.y + handOffsetY };
        };

        this.currentHolder = 0;
        this.ballInMotion = false;
        this.ball = this.physics.add.sprite(0, 0, 'ball');
        this.ball.setBounce(0);
        this.ball.setCollideWorldBounds(false);
        this.ball.setVisible(true);

        this.time.delayedCall(10, () => {
            const handPos = this.getHandPosition(this.players[0]);
            this.ball.setPosition(handPos.x, handPos.y);
        });

        this.setPlayerAnimations = function() {
            this.players.forEach((player, index) => {
                if (index === this.currentHolder) player.play('active');
                else player.play('idle');
            });
        };
        this.setPlayerAnimations();

        this.players.forEach((player, index) => {
            player.on('pointerdown', () => {
                if (this.currentHolder === 0 && index !== 0) {
                    this.players[0].flipX = player.x < this.players[0].x;
                    this.players[0].play('throw');
                    this.players[index].flipX = this.players[0].x < player.x;
                    const throwPos = this.getThrowPosition(this.players[0]);
                    this.ball.setPosition(throwPos.x, throwPos.y);
                    this.ballInMotion = true;
                    this.physics.moveTo(this.ball, player.x, player.y, 600);
                    this.currentHolder = index;
                    this.setPlayerAnimations();
                }
            });
        });

        this.physics.add.overlap(this.ball, this.players, (ball, player) => {
            const playerIndex = this.players.indexOf(player);
            if (!this.ballInMotion) return;

            if (playerIndex === this.currentHolder && !this.isCatching) {
                this.isCatching = true;
                this.ballInMotion = false;
                this.currentHolder = playerIndex;
                ball.setVelocity(0, 0);
                const catchPos = this.getCatchPosition(player);
                ball.setPosition(catchPos.x, catchPos.y);
                player.play('catch');

                this.time.delayedCall(500, () => {
                    player.play('active');
                    this.isCatching = false;
                    if (playerIndex !== 0) {
                        this.time.delayedCall(500, () => {
                            player.play('throw');
                            const cpuThrowPos = this.getThrowPosition(player);
                            this.ball.setPosition(cpuThrowPos.x, cpuThrowPos.y);
                            const otherPlayers = this.players.filter((_, index) => index !== playerIndex);
                            const randomTarget = Phaser.Math.RND.pick(otherPlayers);
                            randomTarget.flipX = player.x < randomTarget.x;
                            this.ballInMotion = true;
                            this.currentHolder = this.players.indexOf(randomTarget);
                            this.physics.moveTo(this.ball, randomTarget.x, randomTarget.y, 600);
                        });
                    }
                });
            }
        });
    }

    update() {
        if (this.players && this.players[0]) {
            if (this.ballInMotion) {
                this.players.forEach(player => {
                    const playerIndex = this.players.indexOf(player);
                    if (playerIndex !== this.currentHolder) {
                        player.flipX = this.ball.x < player.x;
                    }
                });
            } else {
                if (this.currentHolder === 0 && !this.isCatching) {
                    this.players[0].flipX = this.input.x < this.players[0].x;
                }
            }
            if (!this.ballInMotion && !this.isCatching) {
                const holder = this.players[this.currentHolder];
                if (holder) {
                    const handPos = this.getHandPosition(holder);
                    this.ball.setPosition(handPos.x, handPos.y);
                }
            }
        }
    }
};