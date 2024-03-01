import SetElement from '../classes/data/setutils/SetElement';

function hasEmpty(row: (string | number | SetElement)[], indices: number[]) {
    for (const i of indices) {
        if (unpack(row[i]) === '[none]') return true;
    }
    return false;
}

function unpack(i: SetElement | string | number): string | number {
    if (typeof i === 'object') return (i as SetElement).value;
    return i;
}

function rowComparator(
    data: (string | number | SetElement)[][],
    indices: number[],
    rowId1: number,
    rowId2: number
): number {
    const row1 = data[rowId1];
    const row2 = data[rowId2];

    for (const colId of indices) {
        const cell1 = unpack(row1[colId]);
        const cell2 = unpack(row2[colId]);
        if (cell1 === cell2) continue;
        return [cell1, cell2].sort()[0] === cell1 ? -1 : 1;
    }
    return 0;
}

export { rowComparator, unpack, hasEmpty };
