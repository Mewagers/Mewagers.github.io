import React, { useEffect, useRef } from 'react';
import kaboom from 'kaboom';

/**
 * Runs a lightweight Kaboom-powered Flappy Bird style demo used in the
 * portfolio's lab section. The canvas is scaled responsively while the game
 * logic continues to use a fixed internal resolution.
 *
 * @returns {JSX.Element}
 */
const FlappyGame = () => {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const assetBase = process.env.PUBLIC_URL || '';

    useEffect(() => {
        const canvas = canvasRef.current;
        const k = kaboom({
            global: false,
            canvas,
            width: 800,
            height: 600,
        });

        gameRef.current = k;

        k.loadSprite('background', `${assetBase}/background.png`);
        k.loadSprite('bird', `${assetBase}/bird.png`);

        k.scene('gameOver', (score) => {
            k.add([
                k.sprite('background'),
                k.pos(0, 0),
                k.scale(1.1),
                k.z(-1),
            ]);

            k.add([
                k.text(`Game Over!\nScore: ${score}\nPress Space to restart`),
                k.pos(k.width() / 2, k.height() / 2),
                k.anchor('center'),
                k.color(50, 50, 50),
                k.outline(10, [0, 0, 0]),
            ]);

            k.onKeyPress('space', () => {
                k.go('game');
            });

            k.onClick(() => {
                k.go('game');
            });
        });

        k.scene('game', () => {
            const JUMP_FORCE = -400;
            const PIPE_SPEED = 160;
            const BACKGROUND_SPEED = 80;
            const PIPE_GAP = 200;
            const GRAVITY = 1200;
            const PIPE_WIDTH = 64;
            const MIN_PIPE_GAP_FROM_EDGE = 100;

            let score = 0;
            let pipeTimer = null;

            const bg1 = k.add([
                k.sprite('background'),
                k.pos(0, 0),
                k.scale(1, 1.1),
                k.z(-1),
                'background',
            ]);

            const bg2 = k.add([
                k.sprite('background'),
                k.pos(k.width() - 1, 0),
                k.scale(1, 1.1),
                k.z(-1),
                'background',
            ]);

            k.onUpdate(() => {
                bg1.pos.x -= BACKGROUND_SPEED * k.dt();
                bg2.pos.x -= BACKGROUND_SPEED * k.dt();

                if (bg1.pos.x <= -k.width()) {
                    bg1.pos.x = bg2.pos.x + k.width() - 1;
                }
                if (bg2.pos.x <= -k.width()) {
                    bg2.pos.x = bg1.pos.x + k.width() - 1;
                }
            });

            const scoreLabel = k.add([
                k.text(score.toString()),
                k.pos(k.width() / 2, 50),
                k.anchor('center'),
                k.color(50, 50, 50),
                k.z(2),
                k.outline(10, [0, 0, 0]),
            ]);

            const player = k.add([
                k.sprite('bird'),
                k.pos(80, k.height() / 2),
                k.area(),
                k.anchor('center'),
                k.scale(0.05),
                'player',
                {
                    vel: k.vec2(0, 0),
                    update() {
                        this.vel.y += GRAVITY * k.dt();
                        this.pos.y += this.vel.y * k.dt();

                        if (this.pos.y < 0) {
                            this.pos.y = 0;
                            this.vel.y = 0;
                        }

                        if (this.pos.y > k.height()) {
                            if (pipeTimer) {
                                clearInterval(pipeTimer);
                                pipeTimer = null;
                            }
                            k.go('gameOver', score);
                        }

                        const angle = Math.min(Math.max(this.vel.y / 300, -1.2), 1.2) * Math.PI / 2;
                        this.angle = angle;
                    },
                    flap() {
                        this.vel.y = JUMP_FORCE;
                    },
                },
            ]);

            k.onKeyPress('space', () => {
                player.flap();
            });

            k.onClick(() => {
                player.flap();
            });

            function spawnPipe() {
                const minY = MIN_PIPE_GAP_FROM_EDGE;
                const maxY = k.height() - MIN_PIPE_GAP_FROM_EDGE - PIPE_GAP;
                const gapY = k.rand(minY, maxY);

                k.add([
                    k.rect(10, PIPE_GAP / 2),
                    k.pos(k.width(), gapY + PIPE_GAP / 2),
                    k.area(),
                    k.opacity(0),
                    k.move(k.LEFT, PIPE_SPEED),
                    'score-trigger',
                    { scored: false },
                ]);

                k.add([
                    k.rect(PIPE_WIDTH, gapY),
                    k.pos(k.width(), 0),
                    k.area(),
                    k.color(0, 150, 0),
                    k.move(k.LEFT, PIPE_SPEED),
                    'pipe',
                ]);

                k.add([
                    k.rect(PIPE_WIDTH, k.height() - (gapY + PIPE_GAP)),
                    k.pos(k.width(), gapY + PIPE_GAP),
                    k.area(),
                    k.color(0, 150, 0),
                    k.move(k.LEFT, PIPE_SPEED),
                    'pipe',
                ]);
            }

            player.onCollide('pipe', () => {
                if (pipeTimer) {
                    clearInterval(pipeTimer);
                    pipeTimer = null;
                }
                k.go('gameOver', score);
            });

            player.onCollide('score-trigger', (trigger) => {
                if (!trigger.scored) {
                    score += 1;
                    scoreLabel.text = score.toString();
                    trigger.scored = true;
                }
            });

            k.onUpdate(() => {
                k.get('pipe').forEach((pipe) => {
                    if (pipe.pos.x < -PIPE_WIDTH) {
                        k.destroy(pipe);
                    }
                });

                k.get('score-trigger').forEach((trigger) => {
                    if (trigger.pos.x < -10) {
                        k.destroy(trigger);
                    }
                });
            });

            k.wait(1, () => {
                spawnPipe();
                pipeTimer = setInterval(spawnPipe, 1500);
            });

            k.onSceneLeave(() => {
                if (pipeTimer) {
                    clearInterval(pipeTimer);
                    pipeTimer = null;
                }
            });
        });

        k.go('game');

        return () => {
            if (gameRef.current) {
                gameRef.current.destroyAll();
                const ctx = canvas?.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                }
            }
        };
    }, [assetBase]);

    return (
        <div className="lab-canvas">
            <canvas
                ref={canvasRef}
                aria-label="Flappy game demo"
                style={{
                    touchAction: 'none',
                    width: '100%',
                    maxWidth: '800px',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto',
                }}
            />
        </div>
    );
};

export default FlappyGame;
