import { it, expect, beforeEach, describe } from 'vitest';
import { Attribute, Data } from './Data';
import {
    testDataFilename as filename,
    testDataFilename2 as filename2,
    testDataFilename3 as filename3,
    testDataFilename4 as filename4,
    testDataFilename5 as filename5,
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
            data.addCSV(filename2, data2, true);
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
            await data.addCSV(filename2, data2, false);
            data.removeCSV(filename2);
            expect(data.readDatabase().length).toEqual(length);
        });
        it('should remove the first CSV only', async () => {
            const length1 = data.readDatabase().length;
            const data2 = await readBytes(filename2);
            await data.addCSV(filename2, data2, false);
            const length2 = data.readDatabase().length - length1;
            data.removeCSV(filename);
            expect(data.readDatabase().length).toEqual(length2);
        });
        it('should remove all data', async () => {
            const data2 = await readBytes(filename2);
            await data.addCSV(filename2, data2, false);
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
                    if (isNaN(Number(dataValue)) && isNaN(Number(expected))) {
                        console.log('dataValue: ' + typeof dataValue);
                        switch (typeof dataValue) {
                            case 'string':
                                // Check if expected is a string
                                expect(dataValue).toBe(expected);
                                break;
                            case 'number':
                                // This branch should never be reached.
                                assert(false);
                                break;
                            default:
                                // Check if expected is a setItem (filename)
                                expect(dataValue.value).toBe(expected);
                                break;
                        }
                    } else {
                        // Check if expected is a number
                        expect(dataValue).toBeCloseTo(Number(expected));
                    }
                }
            );
        });
    });
    // new has a new set old doesn't have (old: view at end, no upload key (5), new: view at end, upload key at middle (4))
    // new doesn't have a middle set (old: view at end, upload key at middle (4), new: view at end, no upload key (5))
    // new doesn't have last set(s) (old: view at end, upload key at middle (4), new: no view, upload key at middle (3))
    // new has a new set and old has a set new doesn't have (old: no view, upload key at middle (3), new: view at end, no upload key (5))

    /*testdata3: no view, upload key at middle
    testdata4: view at end, upload key at middle
    testdata5: view at end, no upload key*/

    describe('integration of new CSVs', async () => {
        const data3 = await readBytes(filename3);
        const data4 = await readBytes(filename4);
        const data5 = await readBytes(filename5);
        it('should allow all combinations', async () => {
            data = new Data();
            // new has a new set old doesn't have (old: view at end, no upload key (5), new: view at end, upload key at middle (4))
            await data.addCSV(filename5, new Uint8Array(data5), false);
            await data.addCSV(filename4, new Uint8Array(data4), false);
            if (data.readDatabase().at(-1).length != data.readDatabase()[0].length)
                throw 'previous rows not extended';
            if (data.sets[0].size() != 2) throw 'files not added?' + data.sets[0].size();

            data.removeCSV(filename5);
            data.removeCSV(filename4);

            await data.addCSV(filename5, new Uint8Array(data5), false);
            await data.addCSV(filename4, new Uint8Array(data4), false);
            if (data.readDatabase().at(-1).length != data.readDatabase()[0].length)
                throw 'previous rows not extended';
            data.removeCSV(filename4);
            data.removeCSV(filename5);

            // new doesn't have a middle set (old: view at end, upload key at middle (4), new: view at end, no upload key (5))
            await data.addCSV(filename4, new Uint8Array(data4), false);
            await data.addCSV(filename5, new Uint8Array(data5), false);
            data.removeCSV(filename4);
            data.removeCSV(filename5);

            await data.addCSV(filename4, new Uint8Array(data4), false);
            await data.addCSV(filename5, new Uint8Array(data5), false);
            data.removeCSV(filename5);
            data.removeCSV(filename4);

            // new doesn't have last set(s) (old: view at end, upload key at middle (4), new: no view, upload key at middle (3))
            await data.addCSV(filename4, new Uint8Array(data4), false);
            await data.addCSV(filename3, new Uint8Array(data3), false);
            data.removeCSV(filename4);
            data.removeCSV(filename3);

            await data.addCSV(filename4, new Uint8Array(data4), false);
            await data.addCSV(filename3, new Uint8Array(data3), false);
            data.removeCSV(filename3);
            data.removeCSV(filename4);

            // new has a new set and old has a set new doesn't have (old: no view, upload key at middle (3), new: view at end, no upload key (5))
            await data.addCSV(filename3, new Uint8Array(data3), false);
            await data.addCSV(filename5, new Uint8Array(data5), false);
            data.removeCSV(filename3);
            data.removeCSV(filename5);

            await data.addCSV(filename3, new Uint8Array(data3), false);
            await data.addCSV(filename5, new Uint8Array(data5), false);
            data.removeCSV(filename5);
            data.removeCSV(filename3);
        });
    });
});
