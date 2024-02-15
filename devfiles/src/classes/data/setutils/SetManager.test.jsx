import { beforeEach, describe, it, expect } from 'vitest';
import SetManager from './SetManager';
import SetElement from './SetElement';

describe('SetManager', () => {
    let setManager;

    beforeEach(() => {
        setManager = new SetManager();
    });

    describe('hasValue', () => {
        it('should return false when the identifier does not exist', () => {
            expect(setManager.hasValue('test')).toBe(false);
        });

        it('should return true when the identifier exists', () => {
            const element = new SetElement('test');
            setManager.identifiers.add(element);
            expect(setManager.hasValue('test')).toBe(true);
        });
    });

    describe('add', () => {
        it('should add a new identifier', () => {
            const element = setManager.add('test');
            expect(setManager.identifiers.size).toBe(1);
            expect(setManager.identifiers.has(element)).toBe(true);
        });
    });

    describe('changeValue', () => {
        it('should change the value of an existing identifier', () => {
            const element = new SetElement('test');
            setManager.identifiers.add(element);
            setManager.changeValue('test', 'newTest');
            expect(element.getValue()).toBe('newTest');
        });

        it('should return true when successfully changing value', () => {
            const element = new SetElement('test');
            setManager.identifiers.add(element);
            expect(setManager.changeValue('test', 'newTest')).toBe(true);
        });

        it('should return false when the identifier does not exist', () => {
            expect(setManager.changeValue('nonexistent', 'newTest')).toBe(false);
        });
    });

    describe('delete', () => {
        it('should delete an existing identifier', () => {
            const element = new SetElement('test');
            setManager.identifiers.add(element);
            setManager.delete('test');
            expect(setManager.identifiers.size).toBe(0);
        });

        it('should return the deleted identifier', () => {
            const element = new SetElement('test');
            setManager.identifiers.add(element);
            expect(setManager.delete('test')).toBe(element);
        });

        it('should return null when the identifier does not exist', () => {
            expect(setManager.delete('nonexistent')).toBe(null);
        });
    });
});
