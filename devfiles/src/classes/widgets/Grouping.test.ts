import { it, expect, beforeEach, describe } from 'vitest';
import { Data, Attribute } from '../data/Data';
import {
    testDataFilename as filename,
    testDataFilename2 as filename2,
    loadData,
    readBytes
} from '../../tests/utils.test';
import SetElement from '../data/setutils/SetElement';
import { Grouping, BatchNameGrouping, ProjectNameGrouping, FilenameGrouping } from './Grouping';
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
});
