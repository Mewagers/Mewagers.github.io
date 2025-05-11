import React from 'react';
import { Box, Heading, Text, VStack, Container, Button } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';


function About() {

    // Handle download of resume
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/Mwagers_resume.pdf';
        link.download = 'Matthew_Wagers_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Function to get random glitch class
    const getRandomGlitchClass = () => {
        const classes = ['text-glitch-1', 'text-glitch-2', 'text-glitch-3', 'text-glitch-4', 'text-glitch-5'];
        return classes[Math.floor(Math.random() * classes.length)];
    };


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
                        bgGradient="linear(to-r, #64FFDA, #02d7f2)"
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
                            className={getRandomGlitchClass()}
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
                    <Button
                        onClick={handleDownload}
                        className="download-button"
                        leftIcon={<DownloadIcon />}
                        size="lg"
                        mt={8}
                        p={6}
                        bg="transparent"
                        color="#64FFDA"
                        border="2px solid #64FFDA"
                        _hover={{ bg: "transparent" }}
                    >
                        Download Resume
                    </Button>
                </VStack>
            </Container>
        </Box>
    );
}

export default About;