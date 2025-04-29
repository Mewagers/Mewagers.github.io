// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    colors: {
        brand: {
            50: '#e3f2fd',
            100: '#bbdefb',
            500: '#2196f3',
            600: '#1e88e5',
            700: '#1976d2',
        },
    },
    fonts: {
        heading: '"Inter", sans-serif',
        body: '"Inter", sans-serif',
    },
    styles: {
        global: {
            'html, body': {
                backgroundColor: '#f8f8f8',
            },
            '#root': {
                backgroundColor: '#f8f8f8',
            }
        },
    },
    config: {
        initialColorMode: 'light',
        useSystemColorMode: false,
    },
    components: {
        Box: {
            baseStyle: {
                backgroundColor: '#f8f8f8',
            },
        },
    },
});

export default theme;