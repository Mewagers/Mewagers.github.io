import React from 'react';
import {
    Box,
    Container,
    Heading,
    SimpleGrid,
    Text,
    VStack
} from '@chakra-ui/react';

const Skills = () => {
    const skillsList = [
        {
            category: "Programming Languages",
            skills: ["JavaScript", "Java", "Python", "SQL"]
        },
        {
            category: "Web Technologies",
            skills: ["React", "HTML", "CSS", "Chakra UI"]
        },
        {
            category: "Tools & Platforms",
            skills: ["Docker", "GitHub", "Jetbrains", "PostgreSQL"]
        }
    ];


    return (
        <Box py={12} bg="transparent">
            <Container maxW={'6xl'}>
                <VStack spacing={8}>
                    <Heading as="h2" size="xl" color="whitesmoke">
                        Skills
                    </Heading>

                    {skillsList.map((category, index) => (
                        <Box key={index} w="full">
                            <Heading as="h3" size="md" mb={4} color="whitesmoke">
                                {category.category}
                            </Heading>
                            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                                {category.skills.map((skill, skillIndex) => (
                                    <Box
                                        key={skillIndex}
                                        p={4}
                                        bg="rgb(220, 220, 220)"
                                        borderRadius="lg"
                                        boxShadow="md"
                                        textAlign="center"
                                        transition="transform 0.2s"
                                        _hover={{ transform: 'translateY(-2px)' }}
                                    >
                                        <Text>{skill}</Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Box>
                    ))}
                </VStack>
            </Container>
        </Box>
    );

};

export default Skills;