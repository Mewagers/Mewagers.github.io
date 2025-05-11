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
            skills: ["JavaScript", "Java", "Python", "R"]
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

    // Function to get random glitch class
    const getRandomGlitchClass = () => {
        const classes = ['text-glitch-1', 'text-glitch-2', 'text-glitch-3', 'text-glitch-4', 'text-glitch-5'];
        return classes[Math.floor(Math.random() * classes.length)];
    };


    return (
        <Box py={12} bg="transparent">
            <Container maxW={'6xl'}>
                <VStack spacing={8}>
                    <Heading
                        as="h2"
                        fontSize={["3xl", "4xl", "5xl"]}
                        mb={4}
                        bgGradient="linear(to-r, #64FFDA, #4299E1)"
                        bgClip="text"
                        fontWeight="extrabold"

                    >
                        Skills
                    </Heading>

                    {skillsList.map((category, index) => (
                        <Box
                            key={index}
                            w="full"
                        >
                            <Heading
                                as="h3"
                                size="md"
                                mb={4}
                                color="whitesmoke"
                            >
                                {category.category}
                            </Heading>
                            <SimpleGrid
                                columns={{ base: 2, md: 4 }}
                                spacing={4}
                            >
                                {category.skills.map((skill, skillIndex) => (
                                    <Box
                                        key={skillIndex}
                                        p={4}
                                        bg="rgba(255, 255, 255, 0.1)"
                                        borderRadius="lg"
                                        textAlign="center"
                                        className="skill-box"
                                        position="relative"
                                        overflow="hidden"
                                    >
                                        <Text
                                            color="whitesmoke"
                                            fontSize="lg"
                                            fontWeight="bold"
                                            zIndex="2"
                                            position="relative"
                                            className={getRandomGlitchClass()}
                                        >{skill}</Text>
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