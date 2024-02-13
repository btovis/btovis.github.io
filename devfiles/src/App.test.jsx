import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { React } from 'react';
import PageManager from './classes/PageManager.ts';
import MainPage from './ui/MainPage';

test('renders without crashing', () => {
    var manager = new PageManager();
    const { getByText } = render(<MainPage pageManager={manager} />);
    const linkElement = getByText(/Vite \+ React/i);
    expect(linkElement).toBeInTheDocument();
});
