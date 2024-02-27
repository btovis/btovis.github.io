import { it, expect, describe } from 'vitest';
import {
    testDataFilename as filename,
    testDataFilename2 as filename2,
    loadData,
    readBytes
} from '../../tests/utils.test';
import { Attribute, Data } from './Data';
import DataStats from './DataStats';
import SpeciesMeta from '../queryMeta/SpeciesMeta';

describe('DataStats', async () => {
    let data: Data;
    let speciesMeta: SpeciesMeta;
    describe('SpeciesMeta initialised correctly', async () => {
        data = await loadData(filename);
        speciesMeta = data.dataStats.getSpeciesMeta();
        it('Detected right number of groups', () => {
            expect(speciesMeta.groupByGroup.size).toStrictEqual(
                data.sets[data.getIndexForColumn(Attribute.speciesGroup)].refs.size
            );
        });
        it('Detected right number of species', () => {
            expect(
                [...speciesMeta.groupByGroup.values()].reduce((a, b) => a.concat(b)).length
            ).toStrictEqual(
                data.sets[data.getIndexForColumn(Attribute.speciesLatinName)].refs.size
            );
        });

        //Add things to data
        const data2 = await readBytes(filename2);
        await data.addCSV(filename2, data2, false);
        speciesMeta = data.dataStats.getSpeciesMeta();

        it('Detected right number of groups after new file', () => {
            expect(speciesMeta.groupByGroup.size).toStrictEqual(
                data.sets[data.getIndexForColumn(Attribute.speciesGroup)].refs.size
            );
        });
        it('Detected right number of species after new file', () => {
            expect(
                [...speciesMeta.groupByGroup.values()].reduce((a, b) => a.concat(b), []).length
            ).toStrictEqual(
                data.sets[data.getIndexForColumn(Attribute.speciesLatinName)].refs.size
            );
        });
    });
});
