import { it, expect, beforeEach, describe } from 'vitest';
import SetElement from '../data/setutils/SetElement';
import SpeciesMeta from './SpeciesMeta';
import { EndangermentStatus } from '../../utils/speciesVulnerability';
import ReferenceSet from '../data/setutils/ReferenceSet';

function generateTestData(referenceSet: ReferenceSet) {
    const testMap = new Map<
        SetElement,
        [
            species: SetElement,
            englishName: SetElement,
            group: SetElement,
            status: EndangermentStatus
        ]
    >();
    //6 unique species
    //3 unique groups
    //G1: 2, G2: 3, G3: 1
    testMap.set(referenceSet.addRawOrGet('LatinA'), [
        referenceSet.addRawOrGet('A_Id'),
        referenceSet.addRawOrGet('A_Eng'),
        referenceSet.addRawOrGet('G1'),
        EndangermentStatus.LC
    ]);
    testMap.set(referenceSet.addRawOrGet('LatinB'), [
        referenceSet.addRawOrGet('B_Id'),
        referenceSet.addRawOrGet('B_Eng'),
        referenceSet.addRawOrGet('G3'),
        EndangermentStatus.EE
    ]);
    testMap.set(referenceSet.addRawOrGet('LatinC'), [
        referenceSet.addRawOrGet('C_Id'),
        referenceSet.addRawOrGet('C_Eng'),
        referenceSet.addRawOrGet('G2'),
        EndangermentStatus.CR
    ]);
    testMap.set(referenceSet.addRawOrGet('LatinD'), [
        referenceSet.addRawOrGet('D_Id'),
        referenceSet.addRawOrGet('D_Eng'),
        referenceSet.addRawOrGet('G2'),
        EndangermentStatus.NE
    ]);
    testMap.set(referenceSet.addRawOrGet('LatinE'), [
        referenceSet.addRawOrGet('E_Id'),
        referenceSet.addRawOrGet('E_Eng'),
        referenceSet.addRawOrGet('G2'),
        EndangermentStatus.UNKNOWN
    ]);
    testMap.set(referenceSet.addRawOrGet('LatinF'), [
        referenceSet.addRawOrGet('F_Id'),
        referenceSet.addRawOrGet('F_Eng'),
        referenceSet.addRawOrGet('G1'),
        EndangermentStatus.VU
    ]);

    return testMap;
}

describe('SpeciesMeta', async () => {
    const refSet: ReferenceSet = new ReferenceSet();
    let meta: SpeciesMeta;
    beforeEach(() => {
        meta = new SpeciesMeta(generateTestData(refSet));
    });
    describe('groupByGroup', () => {
        it('groupByGroup should have the same species length as the input', () => {
            expect([...meta.groupByGroup.keys()].length).toStrictEqual(3);
        });
        it('groupByGroup[G1] should return LatinA,F', () => {
            expect(meta.groupByGroup.get(refSet.getRef('G1'))).toStrictEqual([
                refSet.getRef('LatinA'),
                refSet.getRef('LatinF')
            ]);
        });
        it('groupByGroup[G2] should return LatinC,D,E', () => {
            expect(meta.groupByGroup.get(refSet.getRef('G2'))).toStrictEqual([
                refSet.getRef('LatinC'),
                refSet.getRef('LatinD'),
                refSet.getRef('LatinE')
            ]);
        });
        it('groupByGroup[G3] should return LatinB', () => {
            expect(meta.groupByGroup.get(refSet.getRef('G3'))).toStrictEqual([
                refSet.getRef('LatinB')
            ]);
        });
    });
    describe('Getters', () => {
        it('englishName should give the right name', () => {
            expect(meta.englishName(refSet.getRef('LatinA')).value).toStrictEqual('A_Eng');
        });
        it('speciesName should give the right name', () => {
            expect(meta.speciesName(refSet.getRef('LatinB')).value).toStrictEqual('B_Id');
        });
        it('speciesGroup should give the right group', () => {
            expect(meta.speciesGroup(refSet.getRef('LatinC')).value).toStrictEqual('G2');
        });
        it('endStatus should give the right status', () => {
            expect(meta.endStatus(refSet.getRef('LatinD'))).toStrictEqual(EndangermentStatus.NE);
        });
    });
    //There are no mutation guards, do not mutate the values in it
});
