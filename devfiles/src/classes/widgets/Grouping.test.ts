import { it, expect, beforeEach, describe } from 'vitest';
import { Data, Attribute } from '../data/Data';
import {
    testDataFilename as filename,
    testDataFilename2 as filename2,
    loadData,
    readBytes
} from '../../tests/utils.test';
import SetElement from '../data/setutils/SetElement';
import {
    Grouping,
    BatchNameGrouping,
    ProjectNameGrouping,
    FilenameGrouping,
    TimeGrouping,
    HourGrouping,
    MonthGrouping,
    YearGrouping
} from './Grouping';
import DataFilterer from '../data/DataFilterer';

describe('Grouping', async () => {
    let data: Data, filter: DataFilterer;
    beforeEach(async () => {
        data = await loadData(filename);
        filter = new DataFilterer(data);
    });
    describe('selectByColumn', () => {
        it('should select values by column', () => {
            const grouping = new BatchNameGrouping(filter);
            const columnIdx = filter.getColumnIndex(Attribute.originalFileName);
            const [dataSubset, _] = filter.getData();
            const values = dataSubset.map((row) => grouping.selectByColumnIndex(row, columnIdx));
            for (const v1 of values) {
                expect(v1).toBeInstanceOf(SetElement);
                for (const v2 of values) {
                    if (v1.value == v2.value) {
                        expect(v1).toEqual(v2);
                    } else {
                        expect(v1).not.toEqual(v2);
                    }
                }
            }
        });
    });
    describe('selectX', () => {
        [
            {
                grouping: FilenameGrouping,
                attribute: Attribute.originalFileName
            },
            {
                grouping: ProjectNameGrouping,
                attribute: Attribute.projectName
            },
            {
                grouping: BatchNameGrouping,
                attribute: Attribute.batchName
            }
        ].forEach(({ grouping, attribute }) => {
            it(`should select values by ${attribute}`, () => {
                const groupingInstance = new grouping(filter);
                const [dataSubset, _] = filter.getData();
                const values = dataSubset.map((row) => groupingInstance.selectX(row));
                for (const v1 of values) {
                    expect(v1).toBeInstanceOf(SetElement);
                    expect(
                        data.readDatabase().map((row) => {
                            const value = row[data.getIndexForColumn(attribute)];
                            if (value instanceof SetElement) {
                                return value.value;
                            } else {
                                return value;
                            }
                        })
                    ).toEqual(expect.arrayContaining([v1.value]));
                    for (const v2 of values) {
                        if (v1.value == v2.value) {
                            expect(v1).toEqual(v2);
                        } else {
                            expect(v1).not.toEqual(v2);
                        }
                    }
                }
            });
        });
        [
            {
                grouping: YearGrouping,
                allowed: ['2023']
            },
            {
                grouping: HourGrouping,
                allowed: ['6', '7', '10', '12', '18', '21']
            },
            {
                grouping: MonthGrouping,
                allowed: ['May', 'June']
            }
        ].forEach(({ grouping, allowed }) => {
            it(`should select values using ${grouping}`, () => {
                const groupingInstance = new grouping(filter);
                const [dataSubset, _] = filter.getData();
                const values = dataSubset.map((row) => groupingInstance.selectX(row));
                const recordedValues = new Set();
                for (const v1 of values) {
                    expect(v1).toBeInstanceOf(SetElement);
                    recordedValues.add(v1.value);
                    for (const v2 of values) {
                        if (v1.value == v2.value) {
                            expect(v1).toEqual(v2);
                        } else {
                            expect(v1).not.toEqual(v2);
                        }
                    }
                }
                expect(recordedValues).toEqual(new Set(allowed));
            });
        });
    });
    describe('selectY', () => {
        it('should select species column', () => {
            const grouping = new BatchNameGrouping(filter);
            const [dataSubset, _] = filter.getData();
            const values = dataSubset.map((row) => grouping.selectY(row));
            for (const v1 of values) {
                expect(v1).toBeInstanceOf(SetElement);
                expect(filter.getDataStats().getSpeciesMeta().speciesList()).toEqual(
                    expect.arrayContaining([v1])
                );
                for (const v2 of values) {
                    if (v1.value == v2.value) {
                        expect(v1).toEqual(v2);
                    } else {
                        expect(v1).not.toEqual(v2);
                    }
                }
            }
        });
    });
    describe('generatePairs', () => {
        it('should generate name, species pairs', () => {
            const grouping = new BatchNameGrouping(filter);
            const pairs = grouping.generatePairs();
            for (const [x, y] of pairs) {
                expect(x).toBeInstanceOf(SetElement);
                expect(y).toBeInstanceOf(SetElement);
                expect(
                    data.readDatabase().reduce((acc, row) => {
                        const batchName = row[data.getIndexForColumn(Attribute.batchName)];
                        const species = row[data.getIndexForColumn(Attribute.speciesLatinName)];
                        if (batchName == x && species == y) {
                            return true;
                        }
                        return acc;
                    }, false)
                ).toBe(true);
            }
        });
    });
});
