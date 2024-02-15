import { expect, describe, it } from 'vitest';
import normaliseIdentifier from './FileIdentifierUtil';
import ReferenceSet from './ReferenceSet';
import SetElement from './SetElement';

describe('FileIdentifierUtil', () => {
    describe('normaliseIdentifier', () => {
        it('should add .csv extension if not present', () => {
            const set = new ReferenceSet();
            const input = 'testFile';
            const expected = 'testFile.csv';
            expect(normaliseIdentifier(input, set)).toBe(expected);
        });

        it('should not modify identifier if .csv extension already present', () => {
            const set = new ReferenceSet();
            const input = 'testFile.csv';
            const expected = 'testFile.csv';
            expect(normaliseIdentifier(input, set)).toBe(expected);
        });

        it('should append underscore before .csv if identifier already exists', () => {
            const set = new ReferenceSet();
            set.addRef(new SetElement('existingFile.csv'));
            const input = 'existingFile.csv';
            const expected = 'existingFile_.csv';
            expect(normaliseIdentifier(input, set)).toBe(expected);
        });

        it('should handle multiple existing identifiers with the same prefix', () => {
            const set = new ReferenceSet();
            set.addRef(new SetElement('existingFile.csv'));
            set.addRef(new SetElement('existingFile_.csv'));
            set.addRef(new SetElement('existingFile_1.csv'));
            const input = 'existingFile.csv';
            const expected = 'existingFile__.csv';
            expect(normaliseIdentifier(input, set)).toBe(expected);
        });
    });
});
