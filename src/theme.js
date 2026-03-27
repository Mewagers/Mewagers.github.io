import { extendTheme } from '@chakra-ui/react';

/**
 * Shared Chakra UI theme tokens for the portfolio. This centralizes color,
 * typography, and component styling so the app has a single visual source of
 * truth.
 */
const theme = extendTheme({
    colors: {
        ink: {
            950: '#07111c',
            900: '#0c1624',
            800: '#142133',
            700: '#1d2d44',
            600: '#273a56',
        },
        brand: {
            50: '#ecfdf9',
            100: '#cdfaef',
            200: '#a2f1de',
            300: '#6ae3ca',
            400: '#34d3af',
            500: '#12b093',
            600: '#0d8d76',
            700: '#106f60',
            800: '#12584d',
            900: '#113f39',
        },
        accent: {
            100: '#dff3ff',
            300: '#9fd8ff',
            500: '#7cc7ff',
            700: '#3f8fcd',
        },
        sand: {
            400: '#f6e6cc',
            500: '#f0dcc0',
        },
    },
    fonts: {
        heading: '"Space Grotesk", sans-serif',
        body: '"DM Sans", sans-serif',
        mono: '"IBM Plex Mono", monospace',
    },
    textStyles: {
        eyebrow: {
            fontFamily: 'mono',
            fontSize: 'xs',
            fontWeight: '500',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
        },
        display: {
            fontFamily: 'heading',
            fontSize: { base: '4xl', md: '6xl', xl: '7xl' },
            fontWeight: '700',
            letterSpacing: '-0.04em',
            lineHeight: '0.98',
        },
        sectionTitle: {
            fontFamily: 'heading',
            fontSize: { base: '3xl', md: '4xl' },
            fontWeight: '700',
            letterSpacing: '-0.03em',
            lineHeight: '1.02',
        },
        lead: {
            fontSize: { base: 'lg', md: 'xl' },
            lineHeight: '1.8',
            color: 'whiteAlpha.800',
        },
    },
    styles: {
        global: {
            'html, body, #root': {
                minHeight: '100%',
                background: 'ink.950',
            },
            body: {
                background: 'ink.950',
                color: 'whiteAlpha.900',
            },
            '::selection': {
                background: 'brand.300',
                color: 'ink.950',
            },
        },
    },
    components: {
        Button: {
            baseStyle: {
                borderRadius: 'full',
                fontWeight: '600',
                transitionProperty: 'common',
                transitionDuration: 'normal',
            },
            sizes: {
                lg: {
                    h: 14,
                    px: 7,
                    fontSize: 'md',
                },
            },
            variants: {
                solid: {
                    color: 'ink.950',
                    bg: 'brand.400',
                    boxShadow: '0 18px 50px rgba(18, 176, 147, 0.24)',
                    _hover: {
                        bg: 'brand.300',
                        transform: 'translateY(-2px)',
                    },
                    _active: {
                        bg: 'brand.500',
                    },
                },
                outline: {
                    color: 'whiteAlpha.900',
                    bg: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid',
                    borderColor: 'whiteAlpha.200',
                    _hover: {
                        bg: 'rgba(255, 255, 255, 0.08)',
                        borderColor: 'brand.300',
                        transform: 'translateY(-2px)',
                    },
                    _active: {
                        bg: 'rgba(255, 255, 255, 0.12)',
                    },
                },
                ghost: {
                    color: 'whiteAlpha.800',
                    _hover: {
                        color: 'whiteAlpha.900',
                        bg: 'rgba(255, 255, 255, 0.06)',
                    },
                },
            },
        },
        Tag: {
            baseStyle: {
                container: {
                    borderRadius: 'full',
                    fontFamily: 'mono',
                    fontSize: 'xs',
                    fontWeight: '500',
                    letterSpacing: '0.08em',
                    px: 3,
                    py: 2,
                },
            },
        },
        Link: {
            baseStyle: {
                _hover: {
                    textDecoration: 'none',
                },
            },
        },
    },
});

export default theme;
