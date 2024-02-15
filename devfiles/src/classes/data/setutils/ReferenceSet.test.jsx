import { beforeEach, describe, it, expect } from 'vitest';
import ReferenceSet from './ReferenceSet';
import SetElement from './SetElement';

describe('ReferenceSet', () => {
    let referenceSet;

    beforeEach(() => {
        referenceSet = new ReferenceSet();
    });

    describe('hasValue', () => {
        it('should return false when the identifier does not exist', () => {
            expect(referenceSet.hasRaw('test')).toBe(false);
        });

        it('should return true when the identifier exists', () => {
            const element = new SetElement('test');
            referenceSet.addRef(element);
            expect(referenceSet.raws.has('test')).toBe(true);
        });
    });

    describe('add', () => {
        it('should add a new identifier', () => {
            const element = referenceSet.addRawOrGet('test');
            expect(referenceSet.size()).toBe(1);
            expect(referenceSet.refs.has(element)).toBe(true);
        });
    });

    describe('changeValue', () => {
        it('should change the value of an existing identifier', () => {
            const element = new SetElement('test');
            referenceSet.addRef(element);
            referenceSet.changeValue('test', 'newTest');
            expect(element.value).toBe('newTest');
        });

        it('should return true when successfully changing value', () => {
            const element = new SetElement('test');
            referenceSet.addRef(element);
            expect(referenceSet.changeValue('test', 'newTest')).toBe(true);
        });

        it('should return false when the identifier does not exist', () => {
            expect(referenceSet.changeValue('nonexistent', 'newTest')).toBe(false);
        });
    });

    describe('delete', () => {
        it('should delete an existing identifier', () => {
            const element = new SetElement('test');
            referenceSet.addRef(element);
            referenceSet.remove('test');
            expect(referenceSet.size()).toBe(0);
        });

        it('should return the deleted identifier', () => {
            const element = new SetElement('test');
            referenceSet.addRef(element);
            expect(referenceSet.remove('test')).toBe(element);
        });

        it('should return null when the identifier does not exist', () => {
            expect(referenceSet.remove('nonexistent')).toBe(null);
        });
    });
});
