import './App.css';
import React from 'react';
import { Box, ChakraProvider, extendTheme } from '@chakra-ui/react';
import Skills from './components/Skills';
import Projects from './components/Projects';
import About from './components/About';

const theme = extendTheme({
    styles: {
        global: {
            body: {
                bgGradient: 'linear(to-r, rgb(10, 10, 130), rgb(25, 25, 25))'
            }
        }
    }
});

function App() {
    return (
        <ChakraProvider theme={theme}>
            <div className="container">
                {/*<div className="glitch-wrapper">*/}
                {/*    <div className="glitch-effect"></div>*/}
                {/*    <div className="glitch-effect"></div>*/}
                {/*    <div className="glitch-effect"></div>*/}
                {/*</div>*/}
                <Box
                    width="100%"
                    minHeight="100vh"
                    position="relative"
                    zIndex={1}
                    bg="transparent"
                    bgGradient="linear(to-r, rgb(0, 0, 100), rgb(25, 25, 25))"
                >
                    <About />
                    <Skills />
                    <Projects />
                </Box>
            </div>
        </ChakraProvider>
    );
}

export default App;