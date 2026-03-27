import './App.css';
import React from 'react';
import { Box, Button, Container, Flex, HStack, Link, Text } from '@chakra-ui/react';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';

const resumeFilename = 'Matthew_Wagers_Resume.pdf';
const resumeHref = `${process.env.PUBLIC_URL}/${resumeFilename}`;

const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
];

/**
 * Renders the portfolio shell, including the sticky navigation, section layout,
 * and shared resume download link used across the site.
 *
 * @returns {JSX.Element}
 */
function App() {
    return (
        <Box className="app-shell">
            <Box className="app-glow app-glow-one" aria-hidden="true" />
            <Box className="app-glow app-glow-two" aria-hidden="true" />
            <Box className="app-glow app-glow-three" aria-hidden="true" />

            <Box as="header" position="sticky" top="0" zIndex="20" px={{ base: 4, md: 6 }} py={4}>
                <Container maxW="7xl" px={0}>
                    <Flex className="nav-shell" align="center" justify="space-between" gap={4}>
                        <Box>
                            <Text textStyle="eyebrow" color="brand.200">
                                Matthew Wagers
                            </Text>
                            <Text fontSize={{ base: 'sm', md: 'md' }} color="whiteAlpha.700">
                                Software developer portfolio
                            </Text>
                        </Box>

                        <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
                            {navLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="nav-link"
                                    fontFamily="mono"
                                    fontSize="sm"
                                    color="whiteAlpha.800"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </HStack>

                        <Button
                            as="a"
                            href={resumeHref}
                            download={resumeFilename}
                            variant="outline"
                            size="sm"
                            flexShrink={0}
                        >
                            Resume
                        </Button>
                    </Flex>
                </Container>
            </Box>

            <Box as="main" position="relative" zIndex="1">
                <About resumeHref={resumeHref} resumeFilename={resumeFilename} />
                <Skills />
                <Projects />
            </Box>

            <Box as="footer" position="relative" zIndex="1" pb={{ base: 8, md: 10 }} px={{ base: 4, md: 6 }}>
                <Container maxW="7xl" px={0}>
                    <Flex
                        align={{ base: 'flex-start', md: 'center' }}
                        justify="space-between"
                        direction={{ base: 'column', md: 'row' }}
                        gap={4}
                        pt={6}
                        borderTop="1px solid"
                        borderColor="whiteAlpha.100"
                    >
                        <Text color="whiteAlpha.600" fontSize="sm">
                            {new Date().getFullYear()} Matthew Wagers. Built with React and Chakra UI.
                        </Text>
                        <Link
                            href="https://github.com/Mewagers/mewagers.github.io"
                            isExternal
                            className="nav-link"
                            fontFamily="mono"
                            fontSize="sm"
                            color="whiteAlpha.700"
                        >
                            View repository
                        </Link>
                    </Flex>
                </Container>
            </Box>
        </Box>
    );
}

export default App;
