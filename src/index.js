import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';

// Inspector-visible multi-line comment (added at runtime so it survives production builds)
const inspectorComment = `I'd try 5 this time :)
    Fvb'cl kvul dlss, iba P't nlaapun ivylk vm aolzl nhtlz. P ovwl fvb ohcl hjj av hu HZJPP ahisl:
    01110111 01100001 01110100 01100011 01101000 00111111 01110110 00111101 01000100 01001100 
    01111010 01111000 01110010 01111010 01000110 01000011 01111001 01001111 01110011`;
document.documentElement.appendChild(document.createComment(inspectorComment));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <App />
        </ChakraProvider>
    </React.StrictMode>
);

reportWebVitals();
