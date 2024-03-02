import generateHash from './generateHash';
import { describe, it, expect } from 'vitest';

describe('GenerateHash', () => {
    it('(2 args) returns the same value for the same input', () => {
        describe.each([
            [5, 3],
            [5, 3],
            [6, 4],
            [6, 4]
        ])('generateHash(%i, %i)', (a, b) => {
            expect(generateHash(a, b)).toBe(generateHash(a, b));
        });
    });
    it('(2 args) generateHash returns different values for different inputs', () => {
        describe.each([
            [5, 3, 6, 4],
            [6, 4, 5, 3],
            [5, 3, 6, 3],
            [6, 3, 6, 4]
        ])('generateHash(%i, %i, %i, %i)', (a, b, c, d) => {
            expect(generateHash(a, b)).not.toBe(generateHash(c, d));
        });
    });
    it('(3 args) returns the same value for the same input', () => {
        describe.each([
            [5, 3, 1],
            [5, 3, 7],
            [6, 4, -2],
            [6, 4, 0]
        ])('generateHash(%i, %i, %i)', (a, b, c) => {
            expect(generateHash(a, b, c)).toBe(generateHash(a, b, c));
        });
    });
    it('(3 args) generateHash returns different values for different inputs', () => {
        describe.each([
            [5, 3, 3, 6, 4, 1232],
            [6, 4, 2, 5, 3, 11],
            [5, 3, 1, 6, 3, 0],
            [6, 3, -5, 6, 4, 2]
        ])('generateHash(%i, %i, %i, %i)', (a, b, c, d, e, f) => {
            expect(generateHash(a, b, c)).not.toBe(generateHash(d, e, f));
        });
    });
});
