import { it, expect, beforeEach, describe } from 'vitest';
import { Attribute, Data } from './Data';
import {
    testDataFilename as filename,
    testDataFilename2 as filename2,
    loadData,
    readBytes
} from '../../tests/utils.test';

describe('Data', async () => {
    let data: Data;
    beforeEach(async () => {
        data = await loadData(filename);
    });
    describe('addCSV', () => {
        it('should add the data', () => {
            expect(data.readDatabase()).not.toStrictEqual([]);
        });
        it('should add more data with second CSV', async () => {
            const length = data.readDatabase().length;
            const data2 = await readBytes(filename2);
            await data.addCSV(filename2, data2);
            expect(data.readDatabase().length).toBeGreaterThan(length);
        });
    });
    describe('removeCSV', () => {
        it('should remove the data', () => {
            const length = data.readDatabase().length;
            data.removeCSV(filename);
            expect(data.readDatabase().length).toBeLessThan(length);
        });
        it('should remove the second CSV only', async () => {
            const length = data.readDatabase().length;
            const data2 = await readBytes(filename2);
            await data.addCSV(filename2, data2);
            data.removeCSV(filename2);
            expect(data.readDatabase().length).toEqual(length);
        });
        it('should remove the first CSV only', async () => {
            const length1 = data.readDatabase().length;
            const data2 = await readBytes(filename2);
            await data.addCSV(filename2, data2);
            const length2 = data.readDatabase().length - length1;
            data.removeCSV(filename);
            expect(data.readDatabase().length).toEqual(length2);
        });
        it('should remove all data', async () => {
            const data2 = await readBytes(filename2);
            await data.addCSV(filename2, data2);
            data.removeCSV(filename);
            data.removeCSV(filename2);
            expect(data.readDatabase()).toStrictEqual([]);
        });
    });
    describe('getIndexForColumn', () => {
        it('should return a number', () => {
            const accessor = data.getIndexForColumn(Attribute.latitude);
            expect(typeof accessor).toBe('number');
        });

        it('getIndexForColumn', () => {
            describe.each([
                { index: 0, attribute: Attribute.latitude, expected: 56.915 },
                { index: 3, attribute: Attribute.longitude, expected: -4.14185 },
                {
                    index: 2,
                    attribute: Attribute.speciesLatinName,
                    expected: 'Troglodytes troglodytes'
                },
                {
                    index: 8,
                    attribute: Attribute.projectName,
                    expected: 'Acoustic Classifier Development'
                },
                { index: 0, attribute: Attribute.species, expected: 46 },
                { index: 5, attribute: Attribute.csvName, expected: filename }
            ])(
                'get accessor for columns with index $index and attribute $attribute',
                async ({ index, attribute, expected }) => {
                    const idx = data.getIndexForColumn(attribute);
                    expect(idx).not.toBeNull();
                    const dataValue = data.readDatabase()[index][idx];
                    if (isNaN(dataValue) && isNaN(expected)) {
                        console.log('dataValue: ' + typeof dataValue);
                        switch (typeof dataValue) {
                            case 'string':
                                // Check if expected is a string
                                expect(dataValue).toBe(expected);
                                break;
                            default:
                                // Check if expected is a setItem (filename)
                                expect(dataValue.value).toBe(expected);
                                break;
                        }
                    } else {
                        // Check if expected is a number
                        expect(dataValue).toBeCloseTo(expected);
                    }
                }
            );
        });
    });
});
