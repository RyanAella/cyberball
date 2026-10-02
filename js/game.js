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
};

// ========== HELPER: CONFIG AUS URL ODER window.cyberballConfig ==========
window.getCyberballParam = function getCyberballParam(name, fallback) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(name)) return urlParams.get(name);
    if (window.cyberballConfig && window.cyberballConfig[name] !== undefined && window.cyberballConfig[name] !== null) {
        return String(window.cyberballConfig[name]);
    }
    return fallback;
};

// ========== HELPER: COMPLETION CODE GENERIEREN ==========
window.generateCompletionCode = function generateCompletionCode(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (prefix || 'CB') + '-' + code;
};

// ========== GAME SCENE CLASS ==========
window.GameScene = class GameScene extends Phaser.Scene {
    preload() {
        // Construct correct base path for assets (handles /cyberball, /cyberball/, /index.html, /cyberball/index.html)
        let basePath = window.location.pathname.replace(/index\.html$/, '');
        if (!basePath.endsWith('/')) basePath += '/';
        this.load.setBaseURL(basePath + 'assets/');

        // Player metadata (names & avatar images) from config
        this.playersMeta = (window.cyberballConfig && window.cyberballConfig.players) || [];
        while (this.playersMeta.length < 4) this.playersMeta.push({});

        this.load.image('ball', 'ball.png');
        this.load.multiatlas('player', 'player.json');

        // Load background image if specified in URL
        const bgUrlParams = new URLSearchParams(window.location.search);
        const bgType = bgUrlParams.get('bgType');
        const bgValue = bgUrlParams.get('bg');

        if (bgType === 'image' && bgValue) {
            const imageUrl = decodeURIComponent(bgValue);
            // Temporarily reset base URL for absolute URLs
            const oldBaseURL = this.load.baseURL;
            this.load.setBaseURL('');
            this.load.image('background', imageUrl);
            this.load.setBaseURL(oldBaseURL);
        }

        // Load avatar images for all players (unique keys)
        this.avatarKeys = [];
        this.playersMeta.forEach((meta, index) => {
            const key = `avatar-${index}`;
            if (meta.avatarUrl) {
                const oldBaseURL = this.load.baseURL;
                this.load.setBaseURL('');
                this.load.image(key, meta.avatarUrl);
                this.load.setBaseURL(oldBaseURL);
                this.avatarKeys.push(key);
            } else {
                this.avatarKeys.push(null);
            }
        });
    }

    create() {
        this.isCatching = false;
        this.gameOver = false;

        // Config
        const cfg = window.cyberballConfig || {};
        this.gameMode = cfg.gameMode || 'inclusion';           // 'inclusion' | 'exclusion'
        this.totalThrows = cfg.totalThrows || 30;
        this.throwCount = 0;
        this.codePrefix = cfg.codePrefix || 'CB';
        this.codeLength = cfg.codeLength || 8;
        this.redirectUrl = cfg.redirectUrl || '';

        // Background
        const bgUrlParams = new URLSearchParams(window.location.search);
        const bgType = bgUrlParams.get('bgType') || 'color';
        const bgValue = bgUrlParams.get('bg') || '#f5f5f5';

        if (bgType === 'color') {
            this.cameras.main.setBackgroundColor(bgValue);
        } else if (bgType === 'image' && bgValue && this.textures.exists('background')) {
            const bg = this.add.image(400, 300, 'background');
            bg.setDisplaySize(800, 600);
            bg.setDepth(-100);
            bg.setOrigin(0.5, 0.5);
        } else {
            this.cameras.main.setBackgroundColor('#f5f5f5');
        }

        // Players
        const cpuCount = cfg.cpuCount || 2;
        const playerColor = cfg.playerColor || '#FFFFFF';

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
            cpuPositions = [{ x: 200, y: 320 }, { x: 400, y: 180 }, { x: 600, y: 320 }];
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

        // Names & avatars from playersMeta
        this.players.forEach((player, index) => {
            const meta = this.playersMeta[index] || {};
            const name = meta.name || (index === 0 ? 'Player 1' : `CPU ${index}`);
            const nameText = this.add.text(
                player.x,
                player.y + 50,
                name,
                { fontFamily: 'Arial', fontSize: '16px', color: '#000000' }
            ).setOrigin(0.5);
            nameText.setDepth(10);

            const avatarKey = this.avatarKeys[index];
            if (avatarKey && this.textures.exists(avatarKey)) {
                const avatar = this.add.image(player.x, player.y - 80, avatarKey);
                avatar.setDisplaySize(48, 48);
                avatar.setDepth(10);
            }
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

        this.setPlayerAnimations = function() {
            this.players.forEach((player, index) => {
                if (index === this.currentHolder) player.play('active');
                else player.play('idle');
            });
        };

        // CPU throws automatically from its current position
        this.cpuThrow = (playerIndex) => {
            const player = this.players[playerIndex];
            player.play('throw');
            const throwPos = this.getThrowPosition(player);
            this.ball.setPosition(throwPos.x, throwPos.y);

            let target;
            if (this.gameMode === 'exclusion') {
                const otherCpus = this.players.filter((_, idx) => idx !== playerIndex && idx !== 0);
                target = Phaser.Math.RND.pick(otherCpus);
                if (!target) target = this.players[playerIndex === 1 ? 2 : 1] || this.players[0];
            } else {
                const otherPlayers = this.players.filter((_, idx) => idx !== playerIndex);
                target = Phaser.Math.RND.pick(otherPlayers);
            }

            target.flipX = player.x < target.x;
            this.ballInMotion = true;
            this.currentHolder = this.players.indexOf(target);
            this.physics.moveTo(this.ball, target.x, target.y, 600);
        };

        // Auto start: ball starts with a random CPU, countdown, then first throw
        this.gameStarted = false;
        const starterIndex = Phaser.Math.Between(1, this.players.length - 1);
        this.currentHolder = starterIndex;
        const startPos = this.getHandPosition(this.players[starterIndex]);
        this.ball.setPosition(startPos.x, startPos.y);
        this.setPlayerAnimations();

        const countdownText = this.add.text(400, 300, '3', {
            fontFamily: 'Arial', fontSize: '64px', color: '#000000', fontStyle: 'bold',
            backgroundColor: 'rgba(255,255,255,0.7)', padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        countdownText.setDepth(50);

        let countdownValue = 3;
        this.time.addEvent({
            delay: 1000,
            repeat: 3,
            callback: () => {
                countdownValue--;
                if (countdownValue > 0) {
                    countdownText.setText(String(countdownValue));
                } else {
                    countdownText.destroy();
                    this.gameStarted = true;
                    this.cpuThrow(starterIndex);
                }
            }
        });

        this.showEndScreen = () => {
            if (this.gameOver) return;
            this.gameOver = true;

            const code = window.generateCompletionCode ?
                window.generateCompletionCode(this.codePrefix) :
                this.codePrefix + '-END';

            window.cyberballCompletionCode = code;

            const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.75);
            overlay.setDepth(100);

            const title = this.add.text(400, 180, 'The game is over.', {
                fontFamily: 'Arial', fontSize: '32px', color: '#ffffff'
            }).setOrigin(0.5);
            title.setDepth(101);

            const codeText = this.add.text(400, 260, 'Your code:', {
                fontFamily: 'Arial', fontSize: '20px', color: '#cccccc'
            }).setOrigin(0.5);
            codeText.setDepth(101);

            const codeValue = this.add.text(400, 320, code, {
                fontFamily: 'Arial', fontSize: '48px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            codeValue.setDepth(101);

            const info = this.add.text(400, 400,
                'Please enter this code in the online survey to confirm\nthat you completed the game.',
                {
                    fontFamily: 'Arial', fontSize: '16px', color: '#cccccc',
                    align: 'center', wordWrap: { width: 600 }
                }).setOrigin(0.5);
            info.setDepth(101);

            if (this.redirectUrl) {
                this.time.delayedCall(5000, () => {
                    window.location.href = this.redirectUrl;
                });
            }
        };

        this.players.forEach((player, index) => {
            player.on('pointerdown', () => {
                if (this.gameOver || !this.gameStarted) return;
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
            if (this.gameOver || !this.gameStarted) return;
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

                this.throwCount++;

                this.time.delayedCall(500, () => {
                    player.play('active');
                    this.isCatching = false;
                    if (playerIndex !== 0) {
                        this.time.delayedCall(500, () => {
                            if (this.gameOver) return;

                            if (this.throwCount >= this.totalThrows && this.totalThrows > 0) {
                                this.showEndScreen();
                                return;
                            }

                            this.cpuThrow(playerIndex);
                        });
                    } else {
                        // Human caught the ball; check end after catch completes
                        if (this.throwCount >= this.totalThrows && this.totalThrows > 0) {
                            this.showEndScreen();
                        }
                    }
                });
            }
        });
    }

    update() {
        if (this.players && this.players[0] && !this.gameOver) {
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
