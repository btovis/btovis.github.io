import { test, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
    const { getByText } = render(<App />);
    const linkElement = getByText(/Vite \+ React/i);
    expect(linkElement).toBeInTheDocument();
});

test('button click updates count', () => {
    const { getByText } = render(<App />);
    const button = getByText(/count is 0/i);

    fireEvent.click(button);
    expect(getByText(/count is 1/i)).toBeInTheDocument();
});
