import { expect, describe, it } from 'vitest';
import FileIdentifierManager from './FileIdentifierManager';

describe('FileIdentifierManager', () => {
    describe('normaliseIdentifier', () => {
        it('should add .csv extension if not present', () => {
            const manager = new FileIdentifierManager();
            const input = 'testFile';
            const expected = 'testFile.csv';
            expect(manager.normaliseIdentifier(input)).toBe(expected);
        });

        it('should not modify identifier if .csv extension already present', () => {
            const manager = new FileIdentifierManager();
            const input = 'testFile.csv';
            const expected = 'testFile.csv';
            expect(manager.normaliseIdentifier(input)).toBe(expected);
        });

        it('should append underscore before .csv if identifier already exists', () => {
            const manager = new FileIdentifierManager();
            manager.add('existingFile.csv');
            const input = 'existingFile.csv';
            const expected = 'existingFile_.csv';
            expect(manager.normaliseIdentifier(input)).toBe(expected);
        });

        it('should handle multiple existing identifiers with the same prefix', () => {
            const manager = new FileIdentifierManager();
            manager.add('existingFile.csv');
            manager.add('existingFile_.csv');
            manager.add('existingFile_1.csv');
            const input = 'existingFile.csv';
            const expected = 'existingFile__.csv';
            expect(manager.normaliseIdentifier(input)).toBe(expected);
        });
    });
});
