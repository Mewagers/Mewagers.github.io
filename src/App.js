import './App.css';
import React from 'react';
import { Box } from '@chakra-ui/react';
import Skills from './components/Skills';
import Projects from './components/Projects';


function App() {
  return (
      <Box bgGradient="linear(to-r, rgb(0, 75, 0), rgb(10, 10, 75))"
           p={4} rounded="md"
      >
        <Skills />
        <Projects />
      </Box>
  );
}

export default App;
