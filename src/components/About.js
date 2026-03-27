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
import { ArrowForwardIcon, DownloadIcon } from '@chakra-ui/icons';

const focusAreas = [
    'Responsive React interfaces',
    'Data storytelling',
    'Thoughtful product design',
];

const stats = [
    {
        value: '3',
        label: 'core lanes',
        detail: 'Front-end, data, and delivery',
    },
    {
        value: 'React',
        label: 'primary stack',
        detail: 'Modern UI work with Chakra UI',
    },
    {
        value: 'CS + DS',
        label: 'background',
        detail: 'Computer Science and Data Science',
    },
];

const highlights = [
    {
        title: 'Interface quality',
        description: 'Layouts that feel structured, readable, and easy to navigate on desktop or mobile.',
    },
    {
        title: 'Data perspective',
        description: 'Analysis and dashboards that help turn raw information into something useful.',
    },
    {
        title: 'Execution',
        description: 'Clean implementation details, stronger defaults, and a focus on finishing polished work.',
    },
];

/**
 * Renders the landing hero with the portfolio introduction, primary calls to
 * action, and a short summary of Matthew's focus areas and background.
 *
 * @param {{ resumeHref: string, resumeFilename: string }} props
 * @returns {JSX.Element}
 */
function About({ resumeHref, resumeFilename }) {
    return (
        <Box
            as="section"
            id="about"
            scrollMarginTop="120px"
            pt={{ base: 6, md: 10 }}
            pb={{ base: 16, md: 24 }}
            px={{ base: 4, md: 6 }}
        >
            <Container maxW="7xl" px={0}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, lg: 12 }} alignItems="stretch">
                    <Stack spacing={8} className="animate-rise">
                        <Tag alignSelf="flex-start" className="info-chip">
                            Available for software and data-focused roles
                        </Tag>

                        <Stack spacing={5}>
                            <Text textStyle="eyebrow" color="brand.200">
                                Software Developer and Data Analyst
                            </Text>
                            <Heading textStyle="display" maxW="14ch">
                                Building polished web experiences with a thoughtful data mindset.
                            </Heading>
                            <Text textStyle="lead" maxW="2xl">
                                I am Matthew Wagers, a developer who enjoys pairing clean interface work with practical
                                analytics. My goal is simple: ship projects that are visually clear, technically solid,
                                and easy for people to understand.
                            </Text>
                        </Stack>

                        <Wrap spacing={3}>
                            {focusAreas.map((item) => (
                                <WrapItem key={item}>
                                    <Tag className="info-chip">{item}</Tag>
                                </WrapItem>
                            ))}
                        </Wrap>

                        <HStack spacing={4} flexWrap="wrap">
                            <Button as="a" href="#projects" size="lg" rightIcon={<ArrowForwardIcon />}>
                                View Projects
                            </Button>
                            <Button
                                as="a"
                                href={resumeHref}
                                download={resumeFilename}
                                size="lg"
                                variant="outline"
                                leftIcon={<DownloadIcon />}
                            >
                                Download Resume
                            </Button>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
                            {stats.map((stat) => (
                                <Box key={stat.label} className="surface-card stat-card">
                                    <Text className="stat-value" color="whiteAlpha.950">
                                        {stat.value}
                                    </Text>
                                    <Text mt={3} textStyle="eyebrow" color="brand.200">
                                        {stat.label}
                                    </Text>
                                    <Text mt={2} color="whiteAlpha.700" lineHeight="1.6">
                                        {stat.detail}
                                    </Text>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Stack>

                    <Box className="surface-card hero-side-panel animate-rise-slow" p={{ base: 6, md: 8 }}>
                        <Stack spacing={6} h="100%">
                            <Box>
                                <Text textStyle="eyebrow" color="brand.200">
                                    Current Focus
                                </Text>
                                <Heading mt={3} fontSize={{ base: '2xl', md: '3xl' }} lineHeight="1.1">
                                    Clear interfaces, strong structure, and projects that tell a story.
                                </Heading>
                            </Box>

                            <Text color="whiteAlpha.760" lineHeight="1.8">
                                I like work that feels intentional from the first glance to the implementation details.
                                That means cleaner hierarchy, better spacing, better decisions about emphasis, and less
                                visual noise.
                            </Text>

                            <Stack spacing={5} flex="1">
                                {highlights.map((item) => (
                                    <Box key={item.title} className="timeline-item">
                                        <Text textStyle="eyebrow" color="brand.200">
                                            {item.title}
                                        </Text>
                                        <Text mt={2} color="whiteAlpha.760" lineHeight="1.7">
                                            {item.description}
                                        </Text>
                                    </Box>
                                ))}
                            </Stack>

                            <Box className="hero-note">
                                <Text textStyle="eyebrow" color="brand.200">
                                    Background
                                </Text>
                                <Text mt={2} color="whiteAlpha.760" lineHeight="1.7">
                                    Bachelor&apos;s degree in Computer Science plus a Data Science certification, with a
                                    strong preference for work that feels organized, modern, and well-finished.
                                </Text>
                            </Box>
                        </Stack>
                    </Box>
                </SimpleGrid>
            </Container>
        </Box>
    );
}

export default About;
