import './App.css';
import React from 'react';
import { Box } from '@chakra-ui/react';
import Skills from './components/Skills';
import Projects from './components/Projects';


function App() {
  return (
      <Box>
        <Skills />
        <Projects />
      </Box>
  );
}

export default App;
