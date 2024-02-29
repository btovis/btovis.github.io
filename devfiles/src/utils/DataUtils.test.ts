import ReferenceSet from '../classes/data/setutils/ReferenceSet.js';
import SetElement from '../classes/data/setutils/SetElement.js';
import { hasEmpty, rowComparator, unpack } from './DataUtils.js';

describe('DataUtils', () => {
    const refSet: ReferenceSet = new ReferenceSet();
    it('hasEmpty returns true if an empty element is present in the indices', () => {
        expect(
            hasEmpty([33, refSet.addRawOrGet('aa'), 112, refSet.addRawOrGet('[none]')], [0, 3])
        ).toStrictEqual(true);
        expect(
            hasEmpty([refSet.addRawOrGet('[none]'), refSet.addRawOrGet('[none]')], [0, 1])
        ).toStrictEqual(true);
        expect(hasEmpty(['[none]', 1, 2, 3], [0])).toStrictEqual(true);
        expect(
            hasEmpty([refSet.addRawOrGet('[warning]'), '[none]', 1, 2, 3], [0, 1, 2, 3, 4])
        ).toStrictEqual(true);
    });
    it('hasEmpty returns false if an empty element is not present in the indices', () => {
        expect(
            hasEmpty(
                ['asdasd', 'udfhaslk', 112, refSet.addRawOrGet('sdajkf'), refSet.addRawOrGet('aa')],
                [0, 3]
            )
        ).toStrictEqual(false);
        expect(
            hasEmpty([refSet.addRawOrGet('[warning]'), '[none]', 1, 2, 3], [0, 2, 3, 4])
        ).toStrictEqual(false);
    });
    it('unpack returns the correct values', () => {
        expect(unpack(refSet.addRawOrGet('hello'))).toStrictEqual('hello');
        expect(unpack(refSet.addRawOrGet('9821u90u9efwijolksadf!'))).toStrictEqual(
            '9821u90u9efwijolksadf!'
        );
        expect(unpack('normal')).toStrictEqual('normal');
        expect(unpack(11)).toStrictEqual(11);
    });

    it('rowComparator can properly sort rows', () => {
        const row01 = [12312, 'haha'];
        const row02 = [12313, 'haha'];
        expect(rowComparator([row01, row02], [0, 1], 0, 1), 'Number Comparison').toStrictEqual(-1);

        //Assert: row1 > row2 > row3 > row4 == row5
        const row1 = [refSet.addRawOrGet('zdajkf'), 12312, 'haha'];
        const row2 = [refSet.addRawOrGet('sdajkf'), 12312, 'haha'];
        const row3 = [refSet.addRawOrGet('sdajkf'), 12303, 'zaha'];
        const row4 = [refSet.addRawOrGet('sdajkf'), 12303, 'haha'];
        const row5 = [refSet.addRawOrGet('sdajkf'), 12303, 'haha'];
        const data = [row5, row3, row2, row1, row4];
        const toBeSorted = [0, 1, 2, 3, 4].sort((id1, id2) =>
            rowComparator(data, [0, 1, 2], id1, id2)
        );

        expect(rowComparator(data, [0, 1, 2], 0, 4), 'Equality test').toStrictEqual(0);
        expect(rowComparator(data, [0, 1, 2], 3, 2), 'Greater than test').toStrictEqual(1);

        expect(data[toBeSorted[0]], 'sorted index 0').toStrictEqual(row5);
        expect(data[toBeSorted[1]], 'sorted index 1').toStrictEqual(row4);
        expect(data[toBeSorted[2]], 'sorted index 2').toStrictEqual(row3);
        expect(data[toBeSorted[3]], 'sorted index 3').toStrictEqual(row2);
        expect(data[toBeSorted[4]], 'sorted index 4').toStrictEqual(row1);
    });
});
