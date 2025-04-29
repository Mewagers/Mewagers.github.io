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
            description: "Created a game using Pygame and allows inputing highscores.",
            technologies: ["Python", "Pycharm", "Pygame"],
            link: "https://gihub.com/Mewagers/snake-game",
            demo: "https://mewagers.github.io"
        }
    ];


    return (
        <Box py={12} bg="transparent">
            <Container maxW={'6xl'}>
                <VStack spacing={8}>
                    <Heading as="h2" size="xl" color="whitesmoke">
                        Projects
                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
                        {projects.map((project, index) => (
                            <Box
                                key={index}
                                bg="rgb(220,220,220)"
                                p={6}
                                borderRadius="lg"
                                boxShadow="xl"
                                transition="transform 0.2s"
                                _hover={{ transform: 'translateY(-4px)' }}
                            >
                                <VStack align="stretch" spacing={4}>
                                    <Heading as="h3" size="md">
                                        {project.title}
                                    </Heading>
                                    <Text>{project.description}</Text>

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
                                        >
                                            View Code
                                        </Button>
                                        <Button
                                            as="a"
                                            href={project.demo}
                                            target="_blank"
                                            colorScheme="green"
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