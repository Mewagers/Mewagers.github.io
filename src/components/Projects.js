import React from 'react';
import {Box, Container, Heading, SimpleGrid, Text, VStack, HStack, Tag, Button} from '@chakra-ui/react';


const Projects = () => {
    const projects = [
        {
            title: "Portfolio Website",
            description: "Created a portfolio website using React and Chakra UI.",
            technologies: ["React", "Node.js", "Chakra UI"],
            link: "https://github.com/Mewagers/mewagers.github.io",
            demo: "https://mewagers.github.io"
        },
        {
            title: "Web Game with Scoreboard",
            description: "Created a game using Pygame and includes highscore system.",
            technologies: ["Python", "Pycharm", "Pygame"],
            link: "https://gihub.com/Mewagers/snake-game",
            demo: "https://mewagers.github.io"
        },
        {
            title: "Tableau Sales Dashboard",
            description: "Performed data analysis on sales data to identify trends and identify potential areas for improvement.",
            technologies: ["Tableau", "SQL"],
            link: "https://github.com/Mewagers/mewagers.github.io",
            demo: "https://mewagers.github.io"
        }
    ];

    // Function to get random glitch class
    const getRandomGlitchClass = () => {
        const classes = ['text-glitch-1', 'text-glitch-2', 'text-glitch-3', 'text-glitch-4', 'text-glitch-5'];
        return classes[Math.floor(Math.random() * classes.length)];
    };


    return (
        <Box py={12} bg="transparent">
            <Container maxW={'6xl'}>
                <VStack spacing={8}>
                    <Heading as="h2"
                             fontSize={["3xl", "4xl", "5xl"]}
                             mb={4}
                             bgGradient="linear(to-r, #64FFDA, #4299E1)"
                             bgClip="text"
                             fontWeight="extrabold"

                    >
                        Projects
                    </Heading>

                    <SimpleGrid
                        columns={{ base: 1, md: 2, lg: 3 }}
                        spacing={8}
                        w="full"
                    >
                        {projects.map((project, index) => (
                            <Box
                                key={index}
                                bg="rgb(220,220,220, 0.2)"
                                p={4}
                                backdropFilter="blur(18px)"
                                borderRadius="lg"
                                border="1px solid rgba(255, 255, 255, 0.18)"
                                boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
                                textAlign="center"
                                transition="all 0.3s ease"
                                _hover={{
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 12px 36px 0 rgba(31, 38, 135, 0.45)',
                                    borderColor: 'rgba(255, 255, 255, 0.25)'
                                }}
                            >
                                <VStack align="stretch" spacing={4}>
                                    <Heading
                                        as="h3"
                                        size="md"
                                        color="whitesmoke"
                                        className={getRandomGlitchClass()}
                                    >
                                        {project.title}
                                    </Heading>
                                    <Text
                                        color="whitesmoke"
                                    >
                                        {project.description}
                                    </Text>

                                    <HStack spacing={2} flexWrap="wrap">
                                        {project.technologies.map((tech, techIndex) => (
                                            <Tag
                                                key={techIndex}
                                                colorScheme="blue"
                                                size="md"
                                            >
                                                {tech}
                                            </Tag>
                                        ))}
                                    </HStack>

                                    <HStack spacing={4}>
                                        <Button
                                            as="a"
                                            href={project.link}
                                            target="_blank"
                                            colorScheme="blue"
                                            color="whitesmoke"
                                        >
                                            View Code
                                        </Button>
                                        <Button
                                            as="a"
                                            href={project.demo}
                                            target="_blank"
                                            colorScheme="green"
                                            color="whitesmoke"
                                        >
                                            Live Demo
                                        </Button>
                                    </HStack>
                                </VStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                </VStack>
            </Container>
        </Box>
    );


};

export default Projects;