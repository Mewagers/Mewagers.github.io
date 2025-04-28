import React from 'react';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Text,
    VStack,
    HStack,
    Tag,
    Button
} from '@chakra-ui/react';


const Projects = () => {
    const projects = [
        {
            title: "Portfolio Website",
            description: "Created a portfolio website using React and Chakra UI.",
            technologies: ["React", "Node.js", "Chakra UI"],
            link: "https://github.com/Mewagers/mewagers.github.io",
            demo: "https://mewagers.github.io"
        },
        // Add more projects here
    ];


    return (
        <Box py={12} bg="white">
            <Container maxW={'6xl'}>
                <VStack spacing={8}>
                    <Heading as="h2" size="xl">
                        Projects
                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
                        {projects.map((project, index) => (
                            <Box
                                key={index}
                                bg="gray.50"
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