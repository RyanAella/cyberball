// ========== PHASER CONFIGURATION ==========
function getGameConfig() {
    const gameContainer = document.getElementById('game-container');
    return {
        type: Phaser.AUTO,
        width: gameContainer.clientWidth,
        height: gameContainer.clientHeight,
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
class GameScene extends Phaser.Scene {
    preload() {
        this.load.setBaseURL('assets/');
        this.load.image('ball', 'ball.png');
        this.load.multiatlas('player', 'player.json');
        
        // Preload background image if specified in URL
        const bgUrlParams = new URLSearchParams(window.location.search);
        const bgType = bgUrlParams.get('bgType');
        const bgValue = bgUrlParams.get('bg');
        
        if (bgType === 'image' && bgValue) {
            this.load.image('background', decodeURIComponent(bgValue));
        }
    }

    create() {
        this.isCatching = false;

        // ===== BACKGROUND =====
        // Read background settings from URL or use defaults
        const bgUrlParams = new URLSearchParams(window.location.search);
        const bgType = bgUrlParams.get('bgType') || 'color';
        const bgValue = bgUrlParams.get('bg') || '#f5f5f5';
        
        // Set background based on type
        if (bgType === 'color') {
            this.cameras.main.setBackgroundColor(bgValue);
        } else if (bgType === 'image' && bgValue) {
            // Add background image (preloaded in preload())
            const bg = this.add.image(400, 300, 'background');
            bg.setDisplaySize(800, 600);
            bg.setDepth(-100); // Behind everything
            bg.setOrigin(0.5, 0.5);
        } else {
            // Default background color
            this.cameras.main.setBackgroundColor('#f5f5f5');
        }

        // ===== PLAYERS =====
        // Player positions: P1 always at bottom center
        // 2 CPUs: CPU 1 left center, CPU 2 right center
        // 3 CPUs: CPU 1 left center, CPU 2 top center (opposite P1), CPU 3 right center (opposite CPU 1)
        
        const cpuCount = window.cyberballConfig?.cpuCount || 2;
        const urlParams = new URLSearchParams(window.location.search);
        const playerColor = urlParams.get('playerColor') || '#FFFFFF';
        
        // Convert hex color to Phaser tint value (remove # and convert to number)
        const playerTint = playerColor.startsWith('#') ? 
            parseInt(playerColor.slice(1), 16) : 
            parseInt(playerColor, 16);
        
        // Player 0 (user) - always at bottom center
        this.players = [
            this.physics.add.sprite(400, 500, 'player', 'idle/1.png') // Player 0 (user)
        ];
        
        // Always apply player color tint (either custom or default #2196F3)
        this.players[0].setTint(playerTint);

        // CPU positions based on count
        let cpuPositions;
        if (cpuCount === 2) {
            cpuPositions = [
                { x: 200, y: 300 },  // CPU 1 - left center
                { x: 600, y: 300 }   // CPU 2 - right center
            ];
        } else if (cpuCount === 3) {
            cpuPositions = [
                { x: 200, y: 300 },  // CPU 1 - left center
                { x: 400, y: 100 },  // CPU 2 - top center (opposite P1)
                { x: 600, y: 300 }   // CPU 3 - right center (opposite CPU 1)
            ];
        } else {
            cpuPositions = [
                { x: 200, y: 300 },
                { x: 600, y: 300 }
            ];
        }

        for (let i = 0; i < cpuCount; i++) {
            this.players.push(
                this.physics.add.sprite(cpuPositions[i].x, cpuPositions[i].y, 'player', 'idle/1.png')
            );
        }

        // Scale players and make them immovable
        this.players.forEach(player => {
            player.setScale(1);
            player.setImmovable(true);
            player.setCollideWorldBounds(true);
            player.setInteractive(); // All players are clickable
        });

        // ===== PLAYER NAMES =====
        const playerNames = ["Player 1", ...Array.from({length: cpuCount}, (_, i) => `CPU ${i + 1}`)];
        this.players.forEach((player, index) => {
            this.add.text(
                player.x,
                player.y + 50,
                playerNames[index],
                { fontFamily: 'Arial', fontSize: '16px', color: '#000000' }
            ).setOrigin(0.5);
        });

        // ===== CREATE ANIMATIONS =====
        this.anims.create({
            key: 'active',
            frames: this.anims.generateFrameNames('player', {
                start: 1, end: 1,
                prefix: 'active/',
                suffix: '.png'
            })
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('player', {
                start: 1, end: 1,
                prefix: 'idle/',
                suffix: '.png'
            })
        });

        this.anims.create({
            key: 'throw',
            frameRate: 12,
            frames: this.anims.generateFrameNames('player', {
                start: 1, end: 3,
                prefix: 'throw/',
                suffix: '.png'
            })
        });

        this.anims.create({
            key: 'catch',
            frames: this.anims.generateFrameNames('player', {
                start: 1, end: 1,
                prefix: 'catch/',
                suffix: '.png'
            }),
            duration: 500,
            repeat: 0
        });

        // Reset animations after completion
        this.players.forEach(player => {
            player.on('animationcomplete', () => {
                const animKey = player.anims.currentAnim.key;
                const playerIndex = this.players.indexOf(player);

                if (animKey === 'throw') {
                    player.play('idle');
                } else if (animKey === 'catch' && playerIndex === this.currentHolder) {
                    player.play('active'); // Ball possession -> active animation
                }
            });
        });

// ===== POSITION FUNCTIONS =====
        // Ball position at player's hand (behind body) when holding
        this.getHandPosition = function(player) {
            const handOffsetX = player.flipX ? 40 : -40;  // Ball on opposite side of view direction
            const handOffsetY = -25;                     // Above the head (raised hand)
            return { x: player.x + handOffsetX, y: player.y + handOffsetY };
        };

        // Ball position when catching (in front of body)
        this.getCatchPosition = function(player) {
            const playerIndex = this.players.indexOf(player);
            const handOffsetX = player.flipX ? -50 : 50;   // Ball on view direction side (front of body)
            // Specific Y position: Player 0 slightly higher (-10), CPUs lower (-8)
            const handOffsetY = (playerIndex === 0) ? -10 : -8;
            return { x: player.x + handOffsetX, y: player.y + handOffsetY };
        };

        // Ball position when throwing (behind player)
        this.getThrowPosition = function(player) {
            const handOffsetX = player.flipX ? -25 : 25;    // Further back
            const handOffsetY = -25;                      // Slightly lower
            return { x: player.x + handOffsetX, y: player.y + handOffsetY };
        };

// ===== BALL LOGIC =====
        this.currentHolder = 0;
        this.ballInMotion = false; // Flag: ball is moving

        // Create ball (no world bounds collision, no bounce)
        this.ball = this.physics.add.sprite(0, 0, 'ball');
        this.ball.setBounce(0);
        this.ball.setCollideWorldBounds(false); // No bouncing off screen edges
        this.ball.setVisible(true);

        // Position ball with delay at start
        this.time.delayedCall(10, () => {
            const handPos = this.getHandPosition(this.players[0]);
            this.ball.setPosition(handPos.x, handPos.y);
        });

        // Set player animations based on ball holder
        this.setPlayerAnimations = function() {
            this.players.forEach((player, index) => {
                if (index === this.currentHolder) {
                    player.play('active'); // Ball possession = active
                } else {
                    player.play('idle');   // No ball = idle
                }
            });
        };
        this.setPlayerAnimations(); // Run at start

// ===== CLICK HANDLERS =====
        // All players are clickable
        this.players.forEach((player, index) => {
            player.on('pointerdown', () => {
                if (this.currentHolder === 0 && index !== 0) {
                    // Thrower looks at target
                    this.players[0].flipX = player.x < this.players[0].x;
                    this.players[0].play('throw');

                    // Target player looks at thrower
                    this.players[index].flipX = this.players[0].x < player.x;

                    // Position ball at throw position (behind player)
                    const throwPos = this.getThrowPosition(this.players[0]);
                    this.ball.setPosition(throwPos.x, throwPos.y);

                    this.ballInMotion = true;
                    this.physics.moveTo(this.ball, player.x, player.y, 600);
                    this.currentHolder = index;
                    this.setPlayerAnimations();
                }
            });
        });

// ===== BALL OVERLAP (CATCH) =====
        this.physics.add.overlap(this.ball, this.players, (ball, player) => {
            const playerIndex = this.players.indexOf(player);
            if (!this.ballInMotion) return;

            // Only catch if player is the current holder and not already catching
            if (playerIndex === this.currentHolder && !this.isCatching) {
                this.isCatching = true;
                this.ballInMotion = false;
                this.currentHolder = playerIndex;  // Set immediately

                // Stop velocity to prevent bouncing
                ball.setVelocity(0, 0);

                // Position ball at catch position (front of body)
                const catchPos = this.getCatchPosition(player);
                ball.setPosition(catchPos.x, catchPos.y);
                player.play('catch');

                this.time.delayedCall(500, () => {
                    player.play('active');
                    this.isCatching = false;

                    if (playerIndex !== 0) {
                        // CPU throws back after catching
                        this.time.delayedCall(500, () => {
                            player.play('throw');
                            const cpuThrowPos = this.getThrowPosition(player);
                            this.ball.setPosition(cpuThrowPos.x, cpuThrowPos.y);

                            // Random target (not the thrower)
                            const otherPlayers = this.players.filter((_, index) => index !== playerIndex);
                            const randomTarget = Phaser.Math.RND.pick(otherPlayers);

                            // Target player looks at thrower
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
            // Ball in motion: All EXCEPT target player look at the ball
            if (this.ballInMotion) {
                this.players.forEach(player => {
                    const playerIndex = this.players.indexOf(player);
                    // Target player keeps their look direction (towards thrower)
                    if (playerIndex === this.currentHolder) {
                        // Keep flipX unchanged
                    }
                    // Others look at the ball
                    else {
                        player.flipX = this.ball.x < player.x;
                    }
                });
            }
            // Ball not in motion: Only current holder can be controlled
            else {
                // Player 0 with ball follows mouse (NOT during catching)
                if (this.currentHolder === 0 && !this.isCatching) {
                    this.players[0].flipX = this.input.x < this.players[0].x;
                }
                // Others keep their look direction (CPU with ball doesn't jitter)
            }

            // Update ball position when a player holds it (NOT during catching)
            if (!this.ballInMotion && !this.isCatching) {
                const holder = this.players[this.currentHolder];
                if (holder) {
                    const handPos = this.getHandPosition(holder);
                    this.ball.setPosition(handPos.x, handPos.y);
                }
            }
        }
    }
}

// ========== START GAME ==========
// Only start game if game-container exists and is visible (game mode)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const gameContainer = document.getElementById('game-container');
        // Check if container exists and is visible (offsetParent !== null means not display:none)
        if (gameContainer && gameContainer.offsetParent !== null) {
            const game = new Phaser.Game(getGameConfig());
            game.scene.add('default', GameScene);
            game.scene.start('default');
        }
    }, 50);
});