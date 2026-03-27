import React from 'react';
import {
    Box,
    Button,
    Container,
    Heading,
    HStack,
    SimpleGrid,
    Stack,
    Tag,
    Text,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import AsteroidsGame from './AsteroidsGame';
import ChessGame from './ChessGame';
import FlappyGame from './FlappyGame';

const featuredProject = {
    label: 'Featured project',
    title: 'Tableau Sales Dashboard',
    description:
        'An interactive dashboard built to surface regional sales patterns and make performance easier to scan, compare, and discuss.',
    detail:
        'This project leans on visual hierarchy and clear reporting so the analysis is easier to act on than a dense spreadsheet export.',
    technologies: ['Tableau', 'SQL'],
    highlights: ['Regional trend visibility', 'Interactive filtering', 'Cleaner stakeholder reporting'],
    link: 'https://github.com/Mewagers/mewagers.github.io',
    demo: 'https://public.tableau.com/app/profile/matt.wagers/viz/RegionalSalesDashboard_17470821183550/Dashboard1?publish=yes',
};

const supportingProject = {
    label: 'Supporting build',
    title: 'Portfolio Website',
    description:
        'A React and Chakra UI portfolio designed to present work more clearly, strengthen first impressions, and stay responsive across screen sizes.',
    technologies: ['React', 'Chakra UI', 'CSS'],
    link: 'https://github.com/Mewagers/mewagers.github.io',
    demo: 'https://mewagers.github.io',
};

const arcadeGames = [
    {
        id: 'asteroids',
        label: 'Arcade shooter',
        title: 'Asteroid Run',
        description:
            'Pilot a ship through an asteroid field, use thrust to stay alive, and clear each wave before the next sector drops in.',
        details:
            'This one leans into quick reaction loops: movement, aiming, level progression, and score chasing in a simple canvas-based arcade format.',
        technologies: ['Canvas', 'React Hooks', 'Keyboard Controls'],
        source: 'https://github.com/Mewagers/Mewagers.github.io/blob/main/src/components/AsteroidsGame.js',
        component: AsteroidsGame,
    },
    {
        id: 'chess',
        label: 'Strategy board',
        title: 'Quick Chess',
        description:
            'A browser-playable chess board with move validation, turn tracking, check states, castling, and en passant.',
        details:
            'It is built to feel approachable but still real enough to play a full match in the browser, with automatic queen promotion to keep the pace moving.',
        technologies: ['React State', 'Board Logic', 'Move Validation'],
        source: 'https://github.com/Mewagers/Mewagers.github.io/blob/main/src/components/ChessGame.js',
        component: ChessGame,
    },
    {
        id: 'flappy',
        label: 'Retro reflex',
        title: 'Sky Hopper',
        description:
            'The original Flappy Bird-style demo stays in the mix as a lighter reflex game and a quick example of animation-heavy browser logic.',
        details:
            'Keeping it in the arcade makes more sense than using it as a main portfolio piece, but it still shows sprite work, movement, and responsive canvas rendering.',
        technologies: ['Kaboom.js', 'Sprites', 'Collision Logic'],
        source: 'https://github.com/Mewagers/Mewagers.github.io/blob/main/src/components/FlappyGame.js',
        component: FlappyGame,
    },
];

/**
 * Presents the featured work, supporting portfolio project, and a selectable
 * browser arcade so visitors can move between multiple games without leaving
 * the page.
 *
 * @returns {JSX.Element}
 */
const Projects = () => {
    const [selectedGameId, setSelectedGameId] = React.useState('asteroids');

    const selectedGame = arcadeGames.find((game) => game.id === selectedGameId) ?? arcadeGames[0];
    const ActiveArcadeGame = selectedGame.component;

    return (
        <Box
            as="section"
            id="projects"
            scrollMarginTop="120px"
            py={{ base: 14, md: 20 }}
            px={{ base: 4, md: 6 }}
        >
            <Container maxW="7xl" px={0}>
                <Stack spacing={8}>
                    <Stack spacing={4} maxW="2xl">
                        <Text textStyle="eyebrow" color="brand.200">
                            Selected Work
                        </Text>
                        <Heading textStyle="sectionTitle" maxW="14ch">
                            Projects with clearer presentation and stronger structure.
                        </Heading>
                        <Text textStyle="lead">
                            The goal here is to show practical range: interface work, data storytelling, and a small
                            in-browser arcade that demonstrates game logic from a few different angles.
                        </Text>
                    </Stack>

                    <Box className="surface-card project-feature" p={{ base: 6, md: 8 }}>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 8, lg: 10 }} alignItems="stretch">
                            <Stack spacing={6}>
                                <Box>
                                    <Text textStyle="eyebrow" color="brand.200">
                                        {featuredProject.label}
                                    </Text>
                                    <Heading mt={3} fontSize={{ base: '2xl', md: '4xl' }} lineHeight="1.05">
                                        {featuredProject.title}
                                    </Heading>
                                </Box>

                                <Text color="whiteAlpha.840" fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.8">
                                    {featuredProject.description}
                                </Text>

                                <Text color="whiteAlpha.700" lineHeight="1.8">
                                    {featuredProject.detail}
                                </Text>

                                <Wrap spacing={3}>
                                    {featuredProject.technologies.map((tech) => (
                                        <WrapItem key={tech}>
                                            <Tag className="info-chip">{tech}</Tag>
                                        </WrapItem>
                                    ))}
                                </Wrap>

                                <HStack spacing={4} flexWrap="wrap">
                                    <Button as="a" href={featuredProject.demo} target="_blank" rightIcon={<ExternalLinkIcon />}>
                                        Open Dashboard
                                    </Button>
                                    <Button
                                        as="a"
                                        href={featuredProject.link}
                                        target="_blank"
                                        variant="outline"
                                        rightIcon={<ExternalLinkIcon />}
                                    >
                                        View Code
                                    </Button>
                                </HStack>
                            </Stack>

                            <Box className="project-visual" p={{ base: 5, md: 6 }}>
                                <Stack spacing={4} position="relative" zIndex="1">
                                    <Text textStyle="eyebrow" color="accent.300">
                                        Project Signals
                                    </Text>

                                    {featuredProject.highlights.map((item) => (
                                        <Box key={item} className="signal-card">
                                            <Text fontWeight="600" color="whiteAlpha.920">
                                                {item}
                                            </Text>
                                        </Box>
                                    ))}

                                    <Box className="signal-card">
                                        <Text textStyle="eyebrow" color="brand.200">
                                            Focus
                                        </Text>
                                        <Text mt={2} color="whiteAlpha.760" lineHeight="1.7">
                                            Data analysis presented in a format that is easier to scan and discuss with
                                            others.
                                        </Text>
                                    </Box>
                                </Stack>
                            </Box>
                        </SimpleGrid>
                    </Box>

                    <Box className="surface-card support-card" p={{ base: 6, md: 7 }}>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="center">
                            <Stack spacing={5}>
                                <Box>
                                    <Text textStyle="eyebrow" color="brand.200">
                                        {supportingProject.label}
                                    </Text>
                                    <Heading mt={3} size="lg">
                                        {supportingProject.title}
                                    </Heading>
                                </Box>

                                <Text color="whiteAlpha.760" lineHeight="1.8">
                                    {supportingProject.description}
                                </Text>

                                <Wrap spacing={3}>
                                    {supportingProject.technologies.map((tech) => (
                                        <WrapItem key={tech}>
                                            <Tag className="info-chip">{tech}</Tag>
                                        </WrapItem>
                                    ))}
                                </Wrap>
                            </Stack>

                            <HStack spacing={4} flexWrap="wrap" justify={{ base: 'flex-start', lg: 'flex-end' }}>
                                <Button as="a" href={supportingProject.demo} target="_blank" rightIcon={<ExternalLinkIcon />}>
                                    Live Site
                                </Button>
                                <Button
                                    as="a"
                                    href={supportingProject.link}
                                    target="_blank"
                                    variant="outline"
                                    rightIcon={<ExternalLinkIcon />}
                                >
                                    Source Code
                                </Button>
                            </HStack>
                        </SimpleGrid>
                    </Box>

                    <Box className="surface-card lab-shell" p={{ base: 6, md: 7 }}>
                        <Stack spacing={6}>
                            <Stack spacing={3}>
                                <Text textStyle="eyebrow" color="brand.200">
                                    Browser Arcade
                                </Text>
                                <Heading size="lg">
                                    Pick a game and play it right here.
                                </Heading>
                                <Text color="whiteAlpha.720" lineHeight="1.8" maxW="3xl">
                                    This section is now less of a single tech demo and more of a small playground. Each
                                    game highlights a different kind of interaction, from arcade movement to turn-based
                                    board logic.
                                </Text>
                            </Stack>

                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                {arcadeGames.map((game) => (
                                    <Button
                                        key={game.id}
                                        onClick={() => setSelectedGameId(game.id)}
                                        variant={selectedGameId === game.id ? 'solid' : 'outline'}
                                        h="auto"
                                        minH="150px"
                                        px={5}
                                        py={5}
                                        whiteSpace="normal"
                                        textAlign="left"
                                        justifyContent="flex-start"
                                    >
                                        <Stack spacing={2} align="flex-start">
                                            <Text textStyle="eyebrow" color={selectedGameId === game.id ? 'ink.950' : 'brand.200'}>
                                                {game.label}
                                            </Text>
                                            <Text fontFamily="heading" fontSize="xl" color="inherit">
                                                {game.title}
                                            </Text>
                                            <Text color={selectedGameId === game.id ? 'ink.900' : 'whiteAlpha.760'}>
                                                {game.description}
                                            </Text>
                                        </Stack>
                                    </Button>
                                ))}
                            </SimpleGrid>

                            <Box className="surface-card lab-frame" p={{ base: 4, md: 6 }}>
                                <SimpleGrid columns={{ base: 1, xl: 12 }} spacing={6} alignItems="start">
                                    <Stack spacing={5} gridColumn={{ xl: 'span 4 / span 4' }}>
                                        <Box>
                                            <Text textStyle="eyebrow" color="brand.200">
                                                {selectedGame.label}
                                            </Text>
                                            <Heading mt={3} size="lg">
                                                {selectedGame.title}
                                            </Heading>
                                        </Box>

                                        <Text color="whiteAlpha.760" lineHeight="1.8">
                                            {selectedGame.details}
                                        </Text>

                                        <Wrap spacing={3}>
                                            {selectedGame.technologies.map((tech) => (
                                                <WrapItem key={tech}>
                                                    <Tag className="info-chip">{tech}</Tag>
                                                </WrapItem>
                                            ))}
                                        </Wrap>

                                        <Button
                                            as="a"
                                            href={selectedGame.source}
                                            target="_blank"
                                            variant="outline"
                                            alignSelf="flex-start"
                                            rightIcon={<ExternalLinkIcon />}
                                        >
                                            View Game Code
                                        </Button>
                                    </Stack>

                                    <Box gridColumn={{ xl: 'span 8 / span 8' }}>
                                        <ActiveArcadeGame />
                                    </Box>
                                </SimpleGrid>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};

export default Projects;
