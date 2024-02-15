import { test, expect } from 'vitest';
import PageManager from './PageManager';

test('PageManager starts with panels and data', () => {
    const pageManager = new PageManager();
    expect(pageManager.panels.length).not.toBeNull();
    expect(pageManager.getData()).not.toBeNull();
});
