import { it, expect, beforeEach, describe } from 'vitest';
import { Data, Attribute } from '../data/Data';
import {
    testDataFilename as filename,
    testDataFilename2 as filename2,
    testDataFilename3 as filename3,
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
    DayGrouping,
    ContinuousMonthGrouping,
    MonthGrouping,
    YearGrouping,
    YGrouping
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
            const grouping = new BatchNameGrouping(filter, YGrouping.Species);
            const columnIdx = filter.getColumnIndex(Attribute.csvName);
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
                attribute: Attribute.csvName
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
                const groupingInstance = new grouping(filter, YGrouping.Species);
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
                allowed: ['06:00', '07:00', '10:00', '12:00', '18:00', '21:00']
            },
            {
                grouping: MonthGrouping,
                allowed: ['May', 'June']
            },
            {
                grouping: DayGrouping,
                allowed: ['08-05-23', '21-06-23', '17-05-23', '01-06-23', '18-05-23']
            },
            {
                grouping: ContinuousMonthGrouping,
                allowed: ['May-2023', 'Jun-2023']
            }
        ].forEach(({ grouping, allowed }) => {
            it(`should select values using ${grouping}`, () => {
                const groupingInstance = new grouping(filter, YGrouping.Species);
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
            const grouping = new BatchNameGrouping(filter, YGrouping.Species);
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
        it('should select species group', async () => {
            const additionalData = await readBytes(filename3);
            data.addCSV(filename3, additionalData, false);
            const grouping = new BatchNameGrouping(filter, YGrouping.SpeciesGroup);
            const [dataSubset, _] = filter.getData();
            const values = dataSubset.map((row) => grouping.selectY(row));
            const speciesMeta = filter.getDataStats().getSpeciesMeta();
            const speciesGroups = Array.from(new Set(speciesMeta.groupByGroup.keys()));
            for (const v1 of values) {
                expect(v1).toBeInstanceOf(SetElement);
                expect(speciesGroups).toEqual(expect.arrayContaining([v1]));
                for (const v2 of values) {
                    if (v1.value == v2.value) {
                        expect(v1).toEqual(v2);
                    } else {
                        expect(v1).not.toEqual(v2);
                    }
                }
            }
        });
        it('should select species by vulnerability', () => {
            const grouping = new BatchNameGrouping(filter, YGrouping.VulnerabilityStatus);
            const [dataSubset, _] = filter.getData();
            const values = dataSubset.map((row) => grouping.selectY(row));
            const speciesMeta = filter.getDataStats().getSpeciesMeta();
            const allSpecies = speciesMeta.speciesList();
            const vulnerabilityStatuses = Array.from(
                new Set(allSpecies.map((s) => speciesMeta.endStatus(s)))
            );
            for (const v1 of values) {
                expect(v1).toBeInstanceOf(SetElement);
                expect(vulnerabilityStatuses).toEqual(expect.arrayContaining([v1.value]));
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
            const grouping = new BatchNameGrouping(filter, YGrouping.Species);
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
    describe('aggregatePairs', () => {
        it('should aggregate pairs', () => {
            const grouping = new BatchNameGrouping(filter, YGrouping.Species);
            const aggregated = grouping.aggregatePairs();
            for (const [y, xMap] of aggregated) {
                expect(y).toBeInstanceOf(SetElement);
                expect(xMap).toBeInstanceOf(Map);
                expect(xMap.size).toBeGreaterThan(0);
                for (const [x, count] of xMap) {
                    expect(x).toBeInstanceOf(SetElement);
                    expect(count).not.toBeNaN();
                    expect(count).toBeGreaterThan(0);
                }
            }
        });
        describe('test on expected examples', () => {
            beforeEach(async () => {
                data = await loadData(filename3);
                filter = new DataFilterer(data);
            });
            [
                {
                    xGrouping: BatchNameGrouping,
                    yGrouping: YGrouping.Species,
                    expected: [
                        ['scotland pam', 'clanga clanga', 4],
                        ['scotland pam', 'cygnus olor', 2],
                        ['scotland pam', 'barbitistes serricauda', 2],
                        ['scotland pam', 'barbitistes fischeri', 2]
                    ]
                },
                {
                    xGrouping: DayGrouping,
                    yGrouping: YGrouping.VulnerabilityStatus,
                    expected: [
                        ['01-08-23', 'vulnerable', 4],
                        ['01-08-23', 'least concern', 2],
                        ['02-08-23', 'least concern', 4]
                    ]
                },
                {
                    xGrouping: HourGrouping,
                    yGrouping: YGrouping.SpeciesGroup,
                    expected: [
                        ['06:00', 'insects', 1],
                        ['07:00', 'insects', 1],
                        ['12:00', 'insects', 2],
                        ['10:00', 'birds', 3],
                        ['12:00', 'birds', 1],
                        ['18:00', 'birds', 1],
                        ['21:00', 'birds', 1]
                    ]
                }
            ].forEach(({ xGrouping, yGrouping, expected }) => {
                it(`should aggregate pairs for ${xGrouping} and ${yGrouping}`, () => {
                    const grouping = new xGrouping(filter, yGrouping);
                    const aggregated = grouping.aggregatePairs();
                    for (const [y, xMap] of aggregated) {
                        for (const [x, count] of xMap) {
                            if (count != 0) {
                                expect(expected).toContainEqual([
                                    x.value.toLowerCase(),
                                    y.value.toLowerCase(),
                                    count
                                ]);
                            }
                        }
                    }
                });
            });
        });
    });
    describe('xValueMap', () => {
        [
            {
                grouping: BatchNameGrouping,
                attribute: Attribute.batchName
            },
            {
                grouping: ProjectNameGrouping,
                attribute: Attribute.projectName
            },
            {
                grouping: FilenameGrouping,
                attribute: Attribute.csvName
            },
            {
                grouping: YearGrouping,
                attribute: 'year'
            },
            {
                grouping: HourGrouping,
                attribute: 'hour'
            },
            {
                grouping: MonthGrouping,
                attribute: 'month'
            },
            {
                grouping: ContinuousMonthGrouping,
                attribute: 'month/year'
            },
            {
                grouping: DayGrouping,
                attribute: 'day'
            }
        ].forEach(({ grouping, attribute }) => {
            it(`should map values for ${attribute} to unique integers`, () => {
                const groupingInstance = new grouping(filter, YGrouping.Species);
                const pairs = groupingInstance.generatePairs();
                const xValueMap = groupingInstance.xIndexMap();
                const mappings = new Set();
                for (const [x, y] of pairs) {
                    const mapping = xValueMap.get(x);
                    expect(mapping).not.toBeUndefined();
                    expect(mapping).not.toBeNaN();
                    mappings.add(mapping);
                }
                if (groupingInstance instanceof TimeGrouping) {
                    for (const i of xValueMap.values()) {
                        mappings.add(i);
                    }
                }
                for (let i = 0; i < mappings.size; i++) {
                    expect(mappings).toContain(i);
                }
            });
        });
    });
    describe('getChart', () => {
        it('should get traces with selected properties', () => {
            const grouping = new BatchNameGrouping(filter, YGrouping.Species);
            const { traces, layout } = grouping.getChart(
                Array(grouping.numTraces()).fill({
                    type: 'bar'
                }),
                {
                    title: 'Bar Chart'
                }
            );
            for (const trace of traces) {
                expect(trace).toHaveProperty('x');
                expect(trace).toHaveProperty('y');
                expect(trace).toHaveProperty('name');
                expect(trace['type']).toBe('bar');
                expect(trace.x).toBeInstanceOf(Array);
                expect(trace.y).toBeInstanceOf(Array);
            }
            expect(layout).toHaveProperty('xaxis');
            expect(layout.title).toEqual('Bar Chart');
        });
    });
});
