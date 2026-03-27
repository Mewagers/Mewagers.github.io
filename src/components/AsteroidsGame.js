import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, HStack, Stack, Tag, Text } from '@chakra-ui/react';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 520;
const SHIP_RADIUS = 16;
const MAX_ASTEROIDS = 8;

const createShip = () => ({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    radius: SHIP_RADIUS,
    invulnerable: 1.8,
    thrusting: false,
});

const randomBetween = (min, max) => min + Math.random() * (max - min);

const createStarfield = () =>
    Array.from({ length: 70 }, () => ({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        size: randomBetween(0.8, 2.4),
        alpha: randomBetween(0.2, 0.85),
    }));

const createAsteroidShape = (radius) =>
    Array.from({ length: 10 }, (_, index) => ({
        angle: (Math.PI * 2 * index) / 10,
        distance: radius * randomBetween(0.72, 1.12),
    }));

const createAsteroid = (x, y, size = 0) => {
    const radii = [46, 30, 18];
    const speeds = [62, 84, 112];

    return {
        x,
        y,
        vx: randomBetween(-speeds[size], speeds[size]),
        vy: randomBetween(-speeds[size], speeds[size]),
        radius: radii[size],
        size,
        angle: randomBetween(0, Math.PI * 2),
        spin: randomBetween(-0.9, 0.9),
        shape: createAsteroidShape(radii[size]),
    };
};

const wrapPosition = (entity) => {
    if (entity.x < -entity.radius) {
        entity.x = GAME_WIDTH + entity.radius;
    }
    if (entity.x > GAME_WIDTH + entity.radius) {
        entity.x = -entity.radius;
    }
    if (entity.y < -entity.radius) {
        entity.y = GAME_HEIGHT + entity.radius;
    }
    if (entity.y > GAME_HEIGHT + entity.radius) {
        entity.y = -entity.radius;
    }
};

const areStatesEqual = (current, next) =>
    current.score === next.score &&
    current.lives === next.lives &&
    current.level === next.level &&
    current.status === next.status;

/**
 * Renders an Asteroids-style arcade game with keyboard controls, score
 * tracking, lives, level progression, and restart support inside the browser.
 *
 * @returns {JSX.Element}
 */
const AsteroidsGame = () => {
    const canvasRef = useRef(null);
    const stageRef = useRef(null);
    const restartGameRef = useRef(() => {});
    const keysRef = useRef({
        left: false,
        right: false,
        thrust: false,
        fire: false,
    });
    const focusedRef = useRef(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hud, setHud] = useState({
        score: 0,
        lives: 3,
        level: 1,
        status: 'Click the arena to start piloting.',
    });

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') {
            return undefined;
        }

        const canvas = canvasRef.current;
        let context = null;

        try {
            context = canvas?.getContext('2d') ?? null;
        } catch {
            context = null;
        }

        if (!canvas || !context) {
            return undefined;
        }

        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;

        let animationFrameId = 0;
        let lastTimestamp = performance.now();

        const game = {
            stars: createStarfield(),
            ship: createShip(),
            bullets: [],
            asteroids: [],
            score: 0,
            lives: 3,
            level: 1,
            fireCooldown: 0,
            status: 'Click the arena to start piloting.',
            gameOver: false,
        };

        const syncHud = () => {
            const nextHud = {
                score: game.score,
                lives: game.lives,
                level: game.level,
                status: game.status,
            };

            setHud((current) => (areStatesEqual(current, nextHud) ? current : nextHud));
        };

        const createSpawnPoint = (minimumDistance) => {
            let x = 0;
            let y = 0;
            let attempts = 0;

            do {
                x = randomBetween(40, GAME_WIDTH - 40);
                y = randomBetween(40, GAME_HEIGHT - 40);
                attempts += 1;
            } while (
                attempts < 40 &&
                Math.hypot(x - GAME_WIDTH / 2, y - GAME_HEIGHT / 2) < minimumDistance
            );

            return { x, y };
        };

        const resetShip = () => {
            game.ship = createShip();
        };

        const spawnLevel = (level) => {
            const asteroidCount = Math.min(3 + level, MAX_ASTEROIDS);
            game.asteroids = [];

            for (let index = 0; index < asteroidCount; index += 1) {
                const spawn = createSpawnPoint(160);
                game.asteroids.push(createAsteroid(spawn.x, spawn.y, 0));
            }

            game.status = `Sector ${level}. Clear the asteroid field.`;
            syncHud();
        };

        const startNewGame = () => {
            game.stars = createStarfield();
            game.ship = createShip();
            game.bullets = [];
            game.asteroids = [];
            game.score = 0;
            game.lives = 3;
            game.level = 1;
            game.fireCooldown = 0;
            game.status = focusedRef.current
                ? 'Sector 1. Clear the asteroid field.'
                : 'Click the arena to start piloting.';
            game.gameOver = false;
            spawnLevel(1);
        };

        const splitAsteroid = (asteroid) => {
            if (asteroid.size >= 2) {
                return [];
            }

            return [
                createAsteroid(asteroid.x, asteroid.y, asteroid.size + 1),
                createAsteroid(asteroid.x, asteroid.y, asteroid.size + 1),
            ];
        };

        const drawBackground = () => {
            const gradient = context.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
            gradient.addColorStop(0, '#040c14');
            gradient.addColorStop(1, '#0f2334');

            context.fillStyle = gradient;
            context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            game.stars.forEach((star) => {
                context.globalAlpha = star.alpha;
                context.fillStyle = '#d8f3ff';
                context.beginPath();
                context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                context.fill();
            });
            context.globalAlpha = 1;
        };

        const drawShip = () => {
            if (game.ship.invulnerable > 0 && Math.floor(game.ship.invulnerable * 10) % 2 === 0) {
                return;
            }

            context.save();
            context.translate(game.ship.x, game.ship.y);
            context.rotate(game.ship.angle);
            context.strokeStyle = '#f8fbff';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(18, 0);
            context.lineTo(-12, -11);
            context.lineTo(-6, 0);
            context.lineTo(-12, 11);
            context.closePath();
            context.stroke();

            if (game.ship.thrusting) {
                context.strokeStyle = '#34d3af';
                context.beginPath();
                context.moveTo(-10, -5);
                context.lineTo(-18, 0);
                context.lineTo(-10, 5);
                context.stroke();
            }

            context.restore();
        };

        const drawBullets = () => {
            context.fillStyle = '#7cc7ff';
            game.bullets.forEach((bullet) => {
                context.beginPath();
                context.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
                context.fill();
            });
        };

        const drawAsteroids = () => {
            context.strokeStyle = '#f0dcc0';
            context.lineWidth = 2;

            game.asteroids.forEach((asteroid) => {
                context.save();
                context.translate(asteroid.x, asteroid.y);
                context.rotate(asteroid.angle);
                context.beginPath();

                asteroid.shape.forEach((point, index) => {
                    const x = Math.cos(point.angle) * point.distance;
                    const y = Math.sin(point.angle) * point.distance;

                    if (index === 0) {
                        context.moveTo(x, y);
                    } else {
                        context.lineTo(x, y);
                    }
                });

                context.closePath();
                context.stroke();
                context.restore();
            });
        };

        const drawOverlay = (message, subtext) => {
            context.fillStyle = 'rgba(4, 12, 20, 0.6)';
            context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            context.fillStyle = '#f8fbff';
            context.textAlign = 'center';
            context.font = '700 36px Space Grotesk, sans-serif';
            context.fillText(message, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 12);
            context.font = '500 18px DM Sans, sans-serif';
            context.fillStyle = '#d1dde8';
            context.fillText(subtext, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24);
        };

        const renderFrame = () => {
            drawBackground();
            drawAsteroids();
            drawBullets();
            drawShip();

            if (game.gameOver) {
                drawOverlay('Mission Failed', 'Press R or Enter to launch again.');
            } else if (!focusedRef.current) {
                drawOverlay('Asteroid Run', 'Click the arena, then use arrow keys and space.');
            }
        };

        const updateGame = (deltaTime) => {
            if (!focusedRef.current || game.gameOver) {
                return;
            }

            const ship = game.ship;
            const keys = keysRef.current;
            const turnSpeed = 3.8;
            const acceleration = 220;
            const damping = Math.pow(0.988, deltaTime * 60);

            ship.thrusting = false;

            if (keys.left) {
                ship.angle -= turnSpeed * deltaTime;
            }
            if (keys.right) {
                ship.angle += turnSpeed * deltaTime;
            }
            if (keys.thrust) {
                ship.vx += Math.cos(ship.angle) * acceleration * deltaTime;
                ship.vy += Math.sin(ship.angle) * acceleration * deltaTime;
                ship.thrusting = true;
            }

            ship.vx *= damping;
            ship.vy *= damping;
            ship.x += ship.vx * deltaTime;
            ship.y += ship.vy * deltaTime;
            wrapPosition(ship);

            if (ship.invulnerable > 0) {
                ship.invulnerable = Math.max(0, ship.invulnerable - deltaTime);
            }

            game.fireCooldown = Math.max(0, game.fireCooldown - deltaTime);

            if (keys.fire && game.fireCooldown === 0) {
                game.bullets.push({
                    x: ship.x + Math.cos(ship.angle) * 20,
                    y: ship.y + Math.sin(ship.angle) * 20,
                    vx: ship.vx + Math.cos(ship.angle) * 360,
                    vy: ship.vy + Math.sin(ship.angle) * 360,
                    life: 0.9,
                });
                game.fireCooldown = 0.24;
                game.status = `Sector ${game.level}. Keep moving.`;
                syncHud();
            }

            game.bullets = game.bullets
                .map((bullet) => ({
                    ...bullet,
                    x: bullet.x + bullet.vx * deltaTime,
                    y: bullet.y + bullet.vy * deltaTime,
                    life: bullet.life - deltaTime,
                }))
                .filter(
                    (bullet) =>
                        bullet.life > 0 &&
                        bullet.x >= -8 &&
                        bullet.x <= GAME_WIDTH + 8 &&
                        bullet.y >= -8 &&
                        bullet.y <= GAME_HEIGHT + 8
                );

            game.asteroids.forEach((asteroid) => {
                asteroid.x += asteroid.vx * deltaTime;
                asteroid.y += asteroid.vy * deltaTime;
                asteroid.angle += asteroid.spin * deltaTime;
                wrapPosition(asteroid);
            });

            for (let bulletIndex = game.bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
                const bullet = game.bullets[bulletIndex];

                for (let asteroidIndex = game.asteroids.length - 1; asteroidIndex >= 0; asteroidIndex -= 1) {
                    const asteroid = game.asteroids[asteroidIndex];
                    const hitDistance = asteroid.radius + 3;

                    if (Math.hypot(bullet.x - asteroid.x, bullet.y - asteroid.y) <= hitDistance) {
                        game.bullets.splice(bulletIndex, 1);
                        game.asteroids.splice(asteroidIndex, 1, ...splitAsteroid(asteroid));
                        game.score += [120, 200, 320][asteroid.size];
                        game.status = `Direct hit. Score ${game.score}.`;
                        syncHud();
                        break;
                    }
                }
            }

            if (ship.invulnerable === 0) {
                const collidedAsteroid = game.asteroids.find(
                    (asteroid) =>
                        Math.hypot(ship.x - asteroid.x, ship.y - asteroid.y) <
                        asteroid.radius + ship.radius - 4
                );

                if (collidedAsteroid) {
                    game.lives -= 1;

                    if (game.lives <= 0) {
                        game.gameOver = true;
                        game.status = `Mission failed with ${game.score} points.`;
                    } else {
                        resetShip();
                        game.status = `Ship damaged. ${game.lives} lives remaining.`;
                    }

                    syncHud();
                }
            }

            if (!game.gameOver && game.asteroids.length === 0) {
                game.level += 1;
                resetShip();
                spawnLevel(game.level);
            }
        };

        const tick = (timestamp) => {
            const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.032);
            lastTimestamp = timestamp;

            updateGame(deltaTime);
            renderFrame();
            animationFrameId = window.requestAnimationFrame(tick);
        };

        restartGameRef.current = startNewGame;
        startNewGame();
        renderFrame();
        animationFrameId = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const updateKeyState = (code, isPressed) => {
        const nextKeys = keysRef.current;

        if (code === 'ArrowLeft') {
            nextKeys.left = isPressed;
        } else if (code === 'ArrowRight') {
            nextKeys.right = isPressed;
        } else if (code === 'ArrowUp') {
            nextKeys.thrust = isPressed;
        } else if (code === 'Space') {
            nextKeys.fire = isPressed;
        } else if (isPressed && (code === 'KeyR' || code === 'Enter')) {
            restartGameRef.current();
        } else {
            return false;
        }

        return true;
    };

    const handleKeyDown = (event) => {
        if (updateKeyState(event.code, true)) {
            event.preventDefault();
        }
    };

    const handleKeyUp = (event) => {
        if (updateKeyState(event.code, false)) {
            event.preventDefault();
        }
    };

    const handleFocus = () => {
        focusedRef.current = true;
        setIsFocused(true);
    };

    const handleBlur = () => {
        focusedRef.current = false;
        keysRef.current = {
            left: false,
            right: false,
            thrust: false,
            fire: false,
        };
        setIsFocused(false);
    };

    const handleActivate = () => {
        stageRef.current?.focus();
    };

    const handleRestart = () => {
        restartGameRef.current();
        stageRef.current?.focus();
    };

    return (
        <Stack spacing={4}>
            <Box
                ref={stageRef}
                as="button"
                type="button"
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={handleActivate}
                className="lab-canvas"
                tabIndex={0}
                width="100%"
                p={0}
                textAlign="left"
                cursor="crosshair"
                _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'brand.300',
                    outlineOffset: '4px',
                }}
            >
                <canvas
                    ref={canvasRef}
                    aria-label="Asteroids style arcade game"
                    style={{
                        width: '100%',
                        maxWidth: '800px',
                        height: 'auto',
                        display: 'block',
                        margin: '0 auto',
                    }}
                />
            </Box>

            <HStack justify="space-between" align="center" flexWrap="wrap" spacing={3}>
                <HStack spacing={3} flexWrap="wrap">
                    <Tag className="info-chip">Score {hud.score}</Tag>
                    <Tag className="info-chip">Lives {hud.lives}</Tag>
                    <Tag className="info-chip">Level {hud.level}</Tag>
                </HStack>

                <Button onClick={handleRestart} variant="outline" size="sm">
                    Restart Run
                </Button>
            </HStack>

            <Text color="whiteAlpha.760" lineHeight="1.7">
                {isFocused ? hud.status : 'Click inside the arena, then use Left, Right, Up, and Space to play.'}
            </Text>
        </Stack>
    );
};

export default AsteroidsGame;
