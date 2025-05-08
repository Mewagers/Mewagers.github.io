import React from 'react';
import { Box, Heading, Text, VStack, Container } from '@chakra-ui/react';

function About() {
    return (
        <Box py={20} px={4}>
            <Container maxW="container.md">
                <VStack
                    spacing={6}
                    align="center"
                    textAlign="center"
                >
                    <Heading
                        as="h1"
                        fontSize={["3xl", "4xl", "5xl"]}
                        mb={1}
                        bgGradient="linear(to-r, #64FFDA, #4299E1)"
                        bgClip="text"
                        fontWeight="extrabold"
                    >
                        Matthew Wagers
                    </Heading>

                    <VStack
                        spacing={2}
                    >
                        <Text
                            fontSize={{ base: "xl", md: "2xl" }}
                            color="whitesmoke"
                            fontWeight="bold"
                        >
                            Software Developer & Data Scientist
                        </Text>

                    </VStack>

                    <Box
                        mt={9}
                    >
                        <Text
                            fontSize="xl"
                            color="whitesmoke"
                            lineHeight="tall"
                            maxW="800px"
                        >
                            I am a passionate software developer with experience in building modern web applications.
                            Holding a Bachelor's degree in Computer Science and a certification in Data Science, I bring
                            attention to detail to all of my projects.
                        </Text>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
}

export default About;