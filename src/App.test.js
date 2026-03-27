import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import theme from './theme';

test('renders the portfolio hero and primary CTA', () => {
    render(
        <ChakraProvider theme={theme}>
            <App />
        </ChakraProvider>
    );

    expect(screen.getByText(/building polished web experiences/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view projects/i })).toBeInTheDocument();
});
