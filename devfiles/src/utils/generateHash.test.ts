import generateHash from './generateHash';
import { describe, it, expect } from 'vitest';

describe('GenerateHash', () => {
    it('returns the same value for the same input', () => {
        describe.each([
            [5, 3],
            [5, 3],
            [6, 4],
            [6, 4]
        ])('generateHash(%i, %i)', (a, b) => {
            expect(generateHash(a, b)).toBe(generateHash(a, b));
        });
    });
    it('generateHash returns different values for different inputs', () => {
        describe.each([
            [5, 3, 6, 4],
            [6, 4, 5, 3],
            [5, 3, 6, 3],
            [6, 3, 6, 4]
        ])('generateHash(%i, %i, %i, %i)', (a, b, c, d) => {
            expect(generateHash(a, b)).not.toBe(generateHash(c, d));
        });
    });
});
