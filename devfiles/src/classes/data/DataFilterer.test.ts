import { it, expect, beforeEach, describe, afterAll } from 'vitest';
import { QueryType, Query } from '../query/Query';
import DataFilterer from './DataFilterer';
import { Attribute, Data } from './Data';
import { testDataFilename as filename, loadData } from '../../tests/utils.test';
import SetQueryArrayReject from '../query/SetQueryArrayReject';
import { setDifference } from './setutils/setDifference';

describe('DataFilterer', async () => {
    let data: Data, filterer: DataFilterer;
    beforeEach(async () => {
        data = await loadData(filename);
        filterer = new DataFilterer(data);
    });
    describe('processQuery', () => {
        describe('Test range filter', () => {
            let columnIdx,
                totalMatched = 0;
            beforeEach(() => {
                columnIdx = data.getIndexForColumn(Attribute.probability);
            });
            it('it should select values less than 0.5', () => {
                const query = [columnIdx, QueryType.Range, -Infinity, 0.5];
                filterer.processQuery(query as unknown as Query);
                const [dataSubset, length] = filterer.getData();
                expect(length).toBeLessThanOrEqual(dataSubset.length);
                totalMatched += length;
                for (const row of dataSubset.slice(0, length)) {
                    expect(row[columnIdx]).toBeLessThanOrEqual(0.5);
                }
            });
            it('it should select values between 0.5 and 0.9', () => {
                const query = [columnIdx, QueryType.Range, 0.5, 0.9];
                filterer.processQuery(query as unknown as Query);
                const [dataSubset, length] = filterer.getData();
                expect(length).toBeLessThanOrEqual(dataSubset.length);
                totalMatched += length;
                for (const row of dataSubset.slice(0, length)) {
                    expect(row[columnIdx]).toBeGreaterThanOrEqual(0.5);
                    expect(row[columnIdx]).toBeLessThanOrEqual(0.9);
                }
            });
            it('it should select values greater than 0.9', () => {
                const query = [columnIdx, QueryType.Range, 0.9, Infinity];
                filterer.processQuery(query as unknown as Query);
                const [dataSubset, length] = filterer.getData();
                expect(length).toBeLessThanOrEqual(dataSubset.length);
                totalMatched += length;
                for (const row of dataSubset.slice(0, length)) {
                    expect(row[columnIdx]).toBeGreaterThanOrEqual(0.9);
                }
            });
            afterAll(() => {
                expect(totalMatched).toBe(data.length());
            });
        });
        describe('Test set element filter', () => {
            let columnIdx,
                totalMatched = 0;
            beforeEach(() => {
                columnIdx = filterer.getColumnIndex(Attribute.warnings);
            });
            it('it should select non-null warnings', () => {
                const query = new SetQueryArrayReject(columnIdx);
                filterer.processQuery(query.query(['[none]']));
                const [dataSubset, length] = filterer.getData();
                expect(length).toBeLessThanOrEqual(dataSubset.length);
                totalMatched += length;
                for (const row of dataSubset.slice(0, length)) {
                    expect(row[columnIdx].value).toBe('Test warning');
                }
            });
            it('it should select empty warnings', () => {
                const query = new SetQueryArrayReject(columnIdx);
                const allVals = new Set([...data.sets[columnIdx].refs].map((a) => a.value));
                filterer.processQuery(
                    query.query([...setDifference(allVals, new Set(['[none]']))])
                );
                const [dataSubset, length] = filterer.getData();
                expect(length).toBeLessThanOrEqual(dataSubset.length);
                totalMatched += length;
                for (const row of dataSubset.slice(0, length)) {
                    expect(row[columnIdx].value).toBe('[none]');
                }
            });
            afterAll(() => {
                expect(totalMatched).toBe(data.length());
            });
        });
    });
});
