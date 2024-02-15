import { describe, expect, it } from 'vitest';
import SetElement from './SetElement';

describe('SetElement', () => {
    describe('constructor', () => {
        it('should set the value correctly', () => {
            const element = new SetElement('testValue');
            expect(element.value).toBe('testValue');
        });
    });

    describe('change', () => {
        it('should change the value correctly', () => {
            const element = new SetElement('initialValue');
            element.value = 'newValue';
            expect(element.value).toBe('newValue');
        });
    });

    describe('getValue', () => {
        it('should return the current value', () => {
            const element = new SetElement('currentValue');
            expect(element.value).toBe('currentValue');
        });
    });

    describe('same value equality', () => {
        it('should be equal to itself after construction', () => {
            const elementA = new SetElement('testValue');
            expect(elementA == elementA).toBe(true);
        });

        it('should remain equal after change', () => {
            const elementA = new SetElement('initialValue');
            elementA.value = 'newValue';
            expect(elementA == elementA).toBe(true);
        });
    });

    describe('different value equality', () => {
        it('should not be equal to after construction', () => {
            const elementA = new SetElement('testValue');
            const elementB = new SetElement('testValue');
            expect(elementA == elementB).toBe(false);
        });

        it('should not be equal after change', () => {
            const elementA = new SetElement('initialValue');
            const elementB = new SetElement('testValue');
            elementA.value = 'testValue';
            expect(elementA == elementB).toBe(false);
        });
    });
});
