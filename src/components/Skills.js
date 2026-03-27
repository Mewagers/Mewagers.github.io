import React from 'react';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Stack,
    Tag,
    Text,
    Wrap,
    WrapItem,
} from '@chakra-ui/react';

const skillGroups = [
    {
        label: 'Build',
        title: 'Front-end development',
        summary: 'Interfaces that feel responsive, intentional, and easy to move through.',
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Chakra UI'],
    },
    {
        label: 'Analyze',
        title: 'Data and reporting',
        summary: 'Tools for exploring trends, shaping dashboards, and presenting findings clearly.',
        skills: ['Python', 'R', 'SQL', 'Tableau', 'PostgreSQL'],
    },
    {
        label: 'Ship',
        title: 'Workflow and delivery',
        summary: 'Reliable habits for turning ideas into finished work without losing clarity.',
        skills: ['Docker', 'GitHub', 'JetBrains', 'Testing', 'Responsive Design'],
    },
];

const workingStyle = [
    'Readable UI structure',
    'Calm motion',
    'Strong defaults',
    'Clean presentation',
];

/**
 * Displays grouped capability cards so the portfolio can quickly communicate
 * the tools, strengths, and working style behind the showcased projects.
 *
 * @returns {JSX.Element}
 */
const Skills = () => {
    return (
        <Box
            as="section"
            id="skills"
            scrollMarginTop="120px"
            py={{ base: 14, md: 20 }}
            px={{ base: 4, md: 6 }}
        >
            <Container maxW="7xl" px={0}>
                <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={{ base: 8, lg: 10 }}>
                    <Stack spacing={5} gridColumn={{ lg: 'span 4 / span 4' }}>
                        <Text textStyle="eyebrow" color="brand.200">
                            Capabilities
                        </Text>
                        <Heading textStyle="sectionTitle" maxW="12ch">
                            Tools I reach for most.
                        </Heading>
                        <Text textStyle="lead" maxW="md">
                            I am strongest when I can pair product-minded UI work with data thinking and a steady
                            delivery workflow.
                        </Text>

                        <Wrap spacing={3} pt={2}>
                            {workingStyle.map((item) => (
                                <WrapItem key={item}>
                                    <Tag className="info-chip">{item}</Tag>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Stack>

                    <SimpleGrid
                        columns={{ base: 1, md: 3 }}
                        spacing={5}
                        gridColumn={{ lg: 'span 8 / span 8' }}
                    >
                        {skillGroups.map((group) => (
                            <Box key={group.title} className="surface-card skill-card" p={6}>
                                <Stack spacing={5} h="100%">
                                    <Box>
                                        <Text textStyle="eyebrow" color="brand.200">
                                            {group.label}
                                        </Text>
                                        <Heading mt={3} size="md" lineHeight="1.25">
                                            {group.title}
                                        </Heading>
                                    </Box>

                                    <Text color="whiteAlpha.740" lineHeight="1.7" flex="1">
                                        {group.summary}
                                    </Text>

                                    <Wrap spacing={3}>
                                        {group.skills.map((skill) => (
                                            <WrapItem key={skill}>
                                                <Tag className="info-chip">{skill}</Tag>
                                            </WrapItem>
                                        ))}
                                    </Wrap>
                                </Stack>
                            </Box>
                        ))}
                    </SimpleGrid>
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default Skills;
