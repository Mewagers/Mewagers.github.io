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
                                        bg="rgba(255, 255, 255, 0.2)"
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
                                        <Text
                                            color="whitesmoke"
                                            fontSize="lg"
                                            fontweight="darkbold"
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