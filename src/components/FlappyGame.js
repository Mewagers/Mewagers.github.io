import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, HStack, Stack, Tag, Text } from '@chakra-ui/react';

const STORAGE_KEY = 'sky-hopper-best-score';
const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const FLOOR_HEIGHT = 92;
const BIRD_X = 240;
const BIRD_RADIUS = 18;
const GRAVITY = 1650;
const FLAP_FORCE = -500;
const BASE_PIPE_SPEED = 230;
const MAX_PIPE_SPEED = 330;
const BASE_GAP_SIZE = 208;
const MIN_GAP_SIZE = 154;
const PIPE_WIDTH = 108;
const BASE_PIPE_INTERVAL = 1.55;
const MIN_PIPE_INTERVAL = 1.08;
const PIPE_MARGIN = 92;
const CLOUD_COUNT = 6;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const randomBetween = (min, max) => min + Math.random() * (max - min);

const readBestScore = () => {
    if (typeof window === 'undefined') {
        return 0;
    }

    try {
        const storedValue = window.localStorage.getItem(STORAGE_KEY);
        const parsedValue = Number.parseInt(storedValue ?? '0', 10);
        return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
    } catch {
        return 0;
    }
};

const createCloud = (index) => ({
    x: randomBetween(-GAME_WIDTH * 0.18, GAME_WIDTH * 1.04),
    y: randomBetween(52, GAME_HEIGHT * 0.46),
    width: randomBetween(110, 220),
    height: randomBetween(34, 66),
    speed: randomBetween(12, 28),
    alpha: randomBetween(0.16, 0.34),
    drift: randomBetween(0.6, 1.5),
    offset: index * 1.2,
});

const createPipe = (score) => {
    const gapSize = clamp(BASE_GAP_SIZE - score * 4, MIN_GAP_SIZE, BASE_GAP_SIZE);
    const gapCenter = randomBetween(
        PIPE_MARGIN + gapSize / 2,
        GAME_HEIGHT - FLOOR_HEIGHT - PIPE_MARGIN - gapSize / 2
    );

    return {
        x: GAME_WIDTH + 120,
        gapTop: gapCenter - gapSize / 2,
        gapBottom: gapCenter + gapSize / 2,
        scored: false,
    };
};

const createInitialGameState = (bestScore) => ({
    phase: 'ready',
    score: 0,
    bestScore,
    bird: {
        x: BIRD_X,
        y: GAME_HEIGHT * 0.44,
        velocity: 0,
        rotation: -0.12,
    },
    pipes: [],
    clouds: Array.from({ length: CLOUD_COUNT }, (_, index) => createCloud(index)),
    particles: [],
    elapsed: 0,
    pipeTimer: 0.95,
    groundOffset: 0,
    flash: 0,
    shake: 0,
});

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    const clampedRadius = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + clampedRadius, y);
    ctx.lineTo(x + width - clampedRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
    ctx.lineTo(x + width, y + height - clampedRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height);
    ctx.lineTo(x + clampedRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
    ctx.lineTo(x, y + clampedRadius);
    ctx.quadraticCurveTo(x, y, x + clampedRadius, y);
    ctx.closePath();
};

const drawCloud = (ctx, cloud) => {
    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.globalAlpha = cloud.alpha;
    ctx.fillStyle = '#f7fbff';

    [
        [-cloud.width * 0.22, 0, cloud.width * 0.26, cloud.height * 0.48],
        [cloud.width * 0.02, -cloud.height * 0.16, cloud.width * 0.34, cloud.height * 0.56],
        [cloud.width * 0.26, 0, cloud.width * 0.22, cloud.height * 0.42],
        [-cloud.width * 0.02, cloud.height * 0.1, cloud.width * 0.48, cloud.height * 0.3],
    ].forEach(([x, y, radiusX, radiusY]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
};

const drawPipeSegment = (ctx, x, y, width, height) => {
    if (height <= 0) {
        return;
    }

    const pipeGradient = ctx.createLinearGradient(x, y, x + width, y);
    pipeGradient.addColorStop(0, '#0f7f87');
    pipeGradient.addColorStop(0.5, '#24c3a3');
    pipeGradient.addColorStop(1, '#097f92');

    ctx.save();

    ctx.fillStyle = pipeGradient;
    ctx.strokeStyle = 'rgba(5, 30, 33, 0.55)';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, x, y, width, height, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    drawRoundedRect(ctx, x + 10, y + 10, 12, Math.max(height - 20, 0), 8);
    ctx.fill();

    const lipHeight = 24;
    const lipY = y === 0 ? height - lipHeight : y;
    const lipGradient = ctx.createLinearGradient(x - 8, lipY, x + width + 8, lipY);
    lipGradient.addColorStop(0, '#117081');
    lipGradient.addColorStop(0.5, '#2cc5a7');
    lipGradient.addColorStop(1, '#107992');

    ctx.fillStyle = lipGradient;
    ctx.strokeStyle = 'rgba(5, 30, 33, 0.45)';
    drawRoundedRect(ctx, x - 8, lipY, width + 16, lipHeight, 12);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
};

const drawBird = (ctx, bird, elapsed, phase) => {
    const wingLift = phase === 'ready' ? Math.sin(elapsed * 9) * 0.35 : clamp(-bird.velocity / 520, -0.6, 0.75);

    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    ctx.fillStyle = 'rgba(18, 36, 51, 0.2)';
    ctx.beginPath();
    ctx.ellipse(-2, 26, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const bodyGradient = ctx.createLinearGradient(-20, -18, 24, 20);
    bodyGradient.addColorStop(0, '#ffe38f');
    bodyGradient.addColorStop(0.58, '#ffb34d');
    bodyGradient.addColorStop(1, '#f77043');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff7dd';
    ctx.beginPath();
    ctx.ellipse(4, 2, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(-2, 6);
    ctx.rotate(wingLift);
    const wingGradient = ctx.createLinearGradient(-18, -4, 14, 18);
    wingGradient.addColorStop(0, '#f79a36');
    wingGradient.addColorStop(1, '#da5b32');
    ctx.fillStyle = wingGradient;
    ctx.beginPath();
    ctx.ellipse(-2, 0, 12, 9, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(10, -5, 5.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#132335';
    ctx.beginPath();
    ctx.arc(11, -5, 2.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff7f56';
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(31, -2);
    ctx.lineTo(18, 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f7684a';
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(-30, -6);
    ctx.lineTo(-27, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
};

const drawCenterOverlay = (ctx, title, subtitle, detail) => {
    const panelWidth = 390;
    const panelHeight = 184;
    const panelX = (GAME_WIDTH - panelWidth) / 2;
    const panelY = 108;

    ctx.save();
    ctx.fillStyle = 'rgba(6, 14, 25, 0.58)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, panelX, panelY, panelWidth, panelHeight, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '700 42px "Space Grotesk", sans-serif';
    ctx.fillText(title, GAME_WIDTH / 2, panelY + 60);

    ctx.fillStyle = 'rgba(239, 250, 255, 0.88)';
    ctx.font = '600 18px Inter, sans-serif';
    ctx.fillText(subtitle, GAME_WIDTH / 2, panelY + 100);

    ctx.fillStyle = 'rgba(214, 228, 242, 0.78)';
    ctx.font = '500 16px Inter, sans-serif';
    ctx.fillText(detail, GAME_WIDTH / 2, panelY + 136);
    ctx.restore();
};

const createBurst = (state, x, y, colorSet, amount = 8) => {
    for (let index = 0; index < amount; index += 1) {
        state.particles.push({
            x,
            y,
            vx: randomBetween(-180, 40),
            vy: randomBetween(-120, 110),
            size: randomBetween(4, 10),
            life: randomBetween(0.22, 0.58),
            maxLife: randomBetween(0.22, 0.58),
            color: colorSet[index % colorSet.length],
        });
    }
};

const updateClouds = (state, dt) => {
    state.clouds.forEach((cloud) => {
        cloud.x -= cloud.speed * dt;
        cloud.y += Math.sin(state.elapsed * cloud.drift + cloud.offset) * dt * 3;

        if (cloud.x < -cloud.width * 0.8) {
            cloud.x = GAME_WIDTH + randomBetween(40, 180);
            cloud.y = randomBetween(52, GAME_HEIGHT * 0.46);
            cloud.width = randomBetween(110, 220);
            cloud.height = randomBetween(34, 66);
            cloud.speed = randomBetween(12, 28);
        }
    });
};

const updateParticles = (state, dt) => {
    state.particles = state.particles.filter((particle) => {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 240 * dt;
        particle.life -= dt;
        return particle.life > 0;
    });
};

const crashGame = (state) => {
    if (state.phase === 'gameover') {
        return;
    }

    state.phase = 'gameover';
    state.flash = 0.22;
    state.shake = 12;
    createBurst(state, state.bird.x, state.bird.y, ['#fff4cf', '#ff9166', '#ffd764'], 16);
};

const updateGame = (state, dt, onScore, onBestScore, onPhaseChange) => {
    const previousPhase = state.phase;
    state.elapsed += dt;
    state.flash = Math.max(0, state.flash - dt);
    state.shake = Math.max(0, state.shake - dt * 18);
    updateClouds(state, dt);
    updateParticles(state, dt);

    const pipeSpeed = clamp(BASE_PIPE_SPEED + state.score * 7, BASE_PIPE_SPEED, MAX_PIPE_SPEED);
    state.groundOffset = (state.groundOffset + pipeSpeed * dt) % 48;

    if (state.phase === 'ready') {
        state.bird.y = GAME_HEIGHT * 0.44 + Math.sin(state.elapsed * 2.8) * 10;
        state.bird.rotation = -0.16 + Math.sin(state.elapsed * 2.8) * 0.03;
        return;
    }

    state.bird.velocity += GRAVITY * dt;
    state.bird.y += state.bird.velocity * dt;
    state.bird.rotation = clamp(state.bird.velocity / 760, -0.55, 1.1);

    if (state.phase === 'running') {
        state.pipeTimer -= dt;

        if (state.pipeTimer <= 0) {
            state.pipes.push(createPipe(state.score));
            state.pipeTimer = clamp(
                BASE_PIPE_INTERVAL - state.score * 0.025,
                MIN_PIPE_INTERVAL,
                BASE_PIPE_INTERVAL
            );
        }

        state.pipes.forEach((pipe) => {
            pipe.x -= pipeSpeed * dt;

            if (!pipe.scored && pipe.x + PIPE_WIDTH * 0.5 < state.bird.x) {
                pipe.scored = true;
                state.score += 1;
                state.shake = Math.max(state.shake, 4);
                createBurst(
                    state,
                    state.bird.x + 8,
                    state.bird.y + 4,
                    ['#d8fff7', '#7ee9d4', '#ffe28b'],
                    7
                );
                onScore(state.score);

                if (state.score > state.bestScore) {
                    state.bestScore = state.score;
                    onBestScore(state.bestScore);
                }
            }
        });

        state.pipes = state.pipes.filter((pipe) => pipe.x > -PIPE_WIDTH - 30);
    }

    const birdTop = state.bird.y - BIRD_RADIUS * 0.78;
    const birdBottom = state.bird.y + BIRD_RADIUS * 0.78;
    const birdLeft = state.bird.x - BIRD_RADIUS * 0.84;
    const birdRight = state.bird.x + BIRD_RADIUS * 0.84;

    if (birdTop <= 18) {
        state.bird.y = 18 + BIRD_RADIUS * 0.78;
        state.bird.velocity = Math.max(state.bird.velocity, 80);
    }

    const floorY = GAME_HEIGHT - FLOOR_HEIGHT - 8;
    if (birdBottom >= floorY) {
        state.bird.y = floorY - BIRD_RADIUS * 0.78;
        state.bird.velocity = 0;
        crashGame(state);
    }

    state.pipes.forEach((pipe) => {
        if (
            birdRight > pipe.x &&
            birdLeft < pipe.x + PIPE_WIDTH &&
            (birdTop < pipe.gapTop || birdBottom > pipe.gapBottom)
        ) {
            crashGame(state);
        }
    });

    if (previousPhase !== 'gameover' && state.phase === 'gameover') {
        onPhaseChange('gameover');
    }
};

const drawGame = (ctx, state) => {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.save();

    if (state.shake > 0) {
        ctx.translate(randomBetween(-state.shake, state.shake), randomBetween(-state.shake, state.shake));
    }

    const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    skyGradient.addColorStop(0, '#7fe2ff');
    skyGradient.addColorStop(0.42, '#72d0ff');
    skyGradient.addColorStop(0.7, '#8ad6ff');
    skyGradient.addColorStop(1, '#f6c28f');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const glow = ctx.createRadialGradient(GAME_WIDTH * 0.76, 96, 30, GAME_WIDTH * 0.76, 96, 180);
    glow.addColorStop(0, 'rgba(255, 251, 214, 0.92)');
    glow.addColorStop(0.5, 'rgba(255, 213, 145, 0.32)');
    glow.addColorStop(1, 'rgba(255, 213, 145, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(GAME_WIDTH * 0.76, 96, 180, 0, Math.PI * 2);
    ctx.fill();

    state.clouds.forEach((cloud) => drawCloud(ctx, cloud));

    ctx.fillStyle = 'rgba(61, 122, 142, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT - FLOOR_HEIGHT - 92);
    ctx.lineTo(120, GAME_HEIGHT - FLOOR_HEIGHT - 148);
    ctx.lineTo(240, GAME_HEIGHT - FLOOR_HEIGHT - 112);
    ctx.lineTo(390, GAME_HEIGHT - FLOOR_HEIGHT - 178);
    ctx.lineTo(540, GAME_HEIGHT - FLOOR_HEIGHT - 118);
    ctx.lineTo(700, GAME_HEIGHT - FLOOR_HEIGHT - 168);
    ctx.lineTo(860, GAME_HEIGHT - FLOOR_HEIGHT - 120);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - FLOOR_HEIGHT - 146);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - FLOOR_HEIGHT);
    ctx.lineTo(0, GAME_HEIGHT - FLOOR_HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(20, 54, 72, 0.65)';
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT - FLOOR_HEIGHT - 38);
    ctx.lineTo(120, GAME_HEIGHT - FLOOR_HEIGHT - 92);
    ctx.lineTo(258, GAME_HEIGHT - FLOOR_HEIGHT - 58);
    ctx.lineTo(412, GAME_HEIGHT - FLOOR_HEIGHT - 104);
    ctx.lineTo(560, GAME_HEIGHT - FLOOR_HEIGHT - 66);
    ctx.lineTo(724, GAME_HEIGHT - FLOOR_HEIGHT - 126);
    ctx.lineTo(862, GAME_HEIGHT - FLOOR_HEIGHT - 70);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - FLOOR_HEIGHT - 96);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - FLOOR_HEIGHT);
    ctx.lineTo(0, GAME_HEIGHT - FLOOR_HEIGHT);
    ctx.closePath();
    ctx.fill();

    state.pipes.forEach((pipe) => {
        drawPipeSegment(ctx, pipe.x, 0, PIPE_WIDTH, pipe.gapTop);
        drawPipeSegment(
            ctx,
            pipe.x,
            pipe.gapBottom,
            PIPE_WIDTH,
            GAME_HEIGHT - FLOOR_HEIGHT - pipe.gapBottom
        );
    });

    state.particles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    drawBird(ctx, state.bird, state.elapsed, state.phase);

    const floorGradient = ctx.createLinearGradient(0, GAME_HEIGHT - FLOOR_HEIGHT, 0, GAME_HEIGHT);
    floorGradient.addColorStop(0, '#2f6f3c');
    floorGradient.addColorStop(0.22, '#497c31');
    floorGradient.addColorStop(1, '#2f4b1f');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, GAME_HEIGHT - FLOOR_HEIGHT, GAME_WIDTH, FLOOR_HEIGHT);

    ctx.fillStyle = '#9bd56a';
    ctx.fillRect(0, GAME_HEIGHT - FLOOR_HEIGHT, GAME_WIDTH, 10);

    for (let x = -state.groundOffset; x < GAME_WIDTH + 64; x += 48) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(x, GAME_HEIGHT - FLOOR_HEIGHT + 16, 22, FLOOR_HEIGHT - 22);
        ctx.fillStyle = 'rgba(34, 60, 24, 0.18)';
        ctx.fillRect(x + 24, GAME_HEIGHT - FLOOR_HEIGHT + 12, 10, FLOOR_HEIGHT - 18);
    }

    ctx.fillStyle = 'rgba(12, 28, 40, 0.16)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.restore();

    if (state.flash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${state.flash * 0.35})`;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '700 48px "Space Grotesk", sans-serif';
    ctx.fillText(`${state.score}`, GAME_WIDTH / 2, 68);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.font = '600 16px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`BEST ${state.bestScore}`, 28, 38);

    if (state.phase === 'ready') {
        drawCenterOverlay(
            ctx,
            'Sky Hopper',
            'Flap through the gates and keep the run alive.',
            'Click, tap, or press Space to launch.'
        );
    }

    if (state.phase === 'gameover') {
        drawCenterOverlay(
            ctx,
            'Run Over',
            `Score ${state.score}   |   Best ${state.bestScore}`,
            'Tap the playfield or use Try Again to restart.'
        );
    }
};

/**
 * Renders a more polished Flappy Bird-style arcade game with smoother controls,
 * a richer canvas presentation, and quick restart flow inside the lab section.
 *
 * @returns {JSX.Element}
 */
const FlappyGame = () => {
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const animationFrameRef = useRef(null);
    const shellRef = useRef(null);
    const [bestScore, setBestScore] = useState(() => readBestScore());
    const bestScoreRef = useRef(bestScore);
    const [score, setScore] = useState(0);
    const [phase, setPhase] = useState('ready');

    const persistBestScore = (nextBestScore) => {
        bestScoreRef.current = nextBestScore;
        setBestScore(nextBestScore);

        try {
            window.localStorage.setItem(STORAGE_KEY, String(nextBestScore));
        } catch {
            // Ignore storage issues and keep the in-memory best score instead.
        }
    };

    const resetGame = (launchImmediately = false) => {
        const nextState = createInitialGameState(bestScoreRef.current);
        gameRef.current = nextState;
        setScore(0);
        setPhase('ready');

        if (launchImmediately) {
            nextState.phase = 'running';
            nextState.bird.velocity = FLAP_FORCE;
            nextState.bird.rotation = -0.45;
            createBurst(nextState, nextState.bird.x - 10, nextState.bird.y + 4, ['#fff9d4', '#94f2ff', '#ffc06d'], 8);
            setPhase('running');
        }
    };

    const handleInput = () => {
        shellRef.current?.focus();

        const state = gameRef.current;
        if (!state) {
            return;
        }

        if (state.phase === 'gameover') {
            resetGame(true);
            return;
        }

        if (state.phase === 'ready') {
            state.phase = 'running';
            setPhase('running');
        }

        state.bird.velocity = FLAP_FORCE;
        state.bird.rotation = -0.45;
        state.shake = Math.max(state.shake, 2);
        createBurst(state, state.bird.x - 10, state.bird.y + 4, ['#fff9d4', '#94f2ff', '#ffc06d'], 8);
    };

    useEffect(() => {
        if (process.env.NODE_ENV === 'test') {
            return undefined;
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx) {
            return undefined;
        }

        resetGame(false);

        let previousFrameTime = window.performance.now();

        const frame = (frameTime) => {
            const currentState = gameRef.current;
            if (!currentState) {
                return;
            }

            const dt = Math.min((frameTime - previousFrameTime) / 1000, 0.032);
            previousFrameTime = frameTime;

            updateGame(
                currentState,
                dt,
                (nextScore) => setScore(nextScore),
                (nextBestScore) => persistBestScore(nextBestScore),
                (nextPhase) => setPhase(nextPhase)
            );
            drawGame(ctx, currentState);

            animationFrameRef.current = window.requestAnimationFrame(frame);
        };

        animationFrameRef.current = window.requestAnimationFrame(frame);

        return () => {
            if (animationFrameRef.current) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, []);

    const statusText =
        phase === 'ready'
            ? 'Click, tap, or press Space to launch. Pipes tighten and speed up as your score climbs.'
            : phase === 'running'
            ? 'Stay low through the openings, then recover early for the next gate.'
            : score > 0 && score === bestScore
            ? `New best score: ${score}. Click, tap, or press Space to jump back in.`
            : `Run over at ${score}. Click, tap, or press Space to try again.`;

    const primaryActionLabel =
        phase === 'running' ? 'Restart Run' : phase === 'gameover' ? 'Try Again' : 'Launch Run';

    return (
        <Stack spacing={4}>
            <HStack justify="space-between" align="center" flexWrap="wrap" spacing={3}>
                <HStack spacing={3} flexWrap="wrap">
                    <Tag className="info-chip">Score {score}</Tag>
                    <Tag className="info-chip">Best {bestScore}</Tag>
                    <Tag className="info-chip">
                        {phase === 'ready' ? 'Ready' : phase === 'running' ? 'In Flight' : 'Crashed'}
                    </Tag>
                    <Tag className="info-chip">Click / Tap / Space</Tag>
                </HStack>

                <HStack spacing={3} flexWrap="wrap">
                    <Button
                        onClick={() => {
                            if (phase === 'running') {
                                resetGame(false);
                                return;
                            }

                            handleInput();
                        }}
                        size="sm"
                    >
                        {primaryActionLabel}
                    </Button>
                    <Button
                        onClick={() => {
                            shellRef.current?.focus();
                            resetGame(false);
                        }}
                        variant="outline"
                        size="sm"
                    >
                        Reset
                    </Button>
                </HStack>
            </HStack>

            <Box
                ref={shellRef}
                className="lab-canvas flappy-shell"
                p={{ base: 2, md: 3 }}
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === ' ' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        handleInput();
                    }
                }}
                sx={{
                    outline: 'none',
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={GAME_WIDTH}
                    height={GAME_HEIGHT}
                    aria-label="Sky Hopper arcade game"
                    onPointerDown={(event) => {
                        event.preventDefault();
                        handleInput();
                    }}
                    onContextMenu={(event) => {
                        event.preventDefault();
                    }}
                    className="flappy-canvas"
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        margin: '0 auto',
                        touchAction: 'none',
                    }}
                />
            </Box>

            <Text color="whiteAlpha.780" lineHeight="1.7">
                {statusText}
            </Text>
            <Text color="whiteAlpha.620" fontSize="sm" lineHeight="1.7">
                The refresh adds a cleaner playfield, stronger score feedback, a more responsive bird, and instant
                restart flow so the game feels snappier inside the arcade.
            </Text>
        </Stack>
    );
};

export default FlappyGame;
