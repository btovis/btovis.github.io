/* Handles merging multiple files together */
//import FileIdentifierManager from "../setutils/FileIdentifierManager";

// CSVColumnList is fresh from file
// columnList, CSVContents is modified, database is modified
/*function integrate(columnList: string[], database: (string | number)[][], CSVColumnList: string[], CSVContents: string[][], CSVIdentifier: FileIdentifierManager) {

}
function sortNewFile(db: (string | number)[], compKey: number): (string | number)[] {
    return [];
}

// TODO: JS Date conversion first
function mergeSort(db1: (string | number)[], db2: (string | number)[], compKey: number): (string|number)[] {
    return [];
}*/

import ReferenceSet from '../setutils/ReferenceSet';

function getProcessorForColumn(columnName, set: ReferenceSet) /*: (cell: string) => any*/ {
    // Make set manager for each row that wants a

    switch (columnName) {
        case 'RECORDING FILE NAME':
            return (x) => x;
        case 'ORIGINAL FILE NAME':
            return (x) => x;
        case 'ORIGINAL FILE PART':
            return parseInt;
        case 'LATITUDE':
            return parseFloat;
        case 'LONGITUDE':
            return parseFloat;
        case 'SPECIES': // Set
            return (a) => set.addRawOrGet(a);
        case 'SCIENTIFIC NAME': // Set
            return (a) => set.addRawOrGet(a);
        case 'ENGLISH NAME': // Set
            return (a) => set.addRawOrGet(a);
        case 'SPECIES GROUP': // Set
            return (a) => set.addRawOrGet(a);
        case 'PROBABILITY':
            return parseFloat;
        case 'WARNINGS': // Set, or null
            return (a) => set.addRawOrGet(a);
        case 'CALL TYPE':
            // TODO Handle nulls, string set
            return (a) => set.addRawOrGet(a);

        case 'ACTUAL DATE':
            // Infer american or british
            return (x) => x;

        case 'SURVEY DATE':
            // Infer american or british
            return (x) => x;

        case 'TIME':
            // 24H
            return (x) => x;

        case 'CLASSIFIER NAME':
            // Set
            return (a) => set.addRawOrGet(a);

        case 'USER ID':
            // Set
            return (a) => set.addRawOrGet(a);

        case 'UPLOAD KEY':
            // Set
            return (a) => set.addRawOrGet(a);

        case 'BATCH NAME':
            // Set
            return (a) => set.addRawOrGet(a);

        case 'PROJECT NAME':
            // Set
            return (a) => set.addRawOrGet(a);

        // For now:
        // TODO: sets, infer american or british
        default:
            return (x) => x;
    }
}

function columnNeedsSet(columnName) {
    switch (columnName) {
        case 'RECORDING FILE NAME':
        case 'ORIGINAL FILE NAME':
        case 'ORIGINAL FILE PART':
        case 'LATITUDE':
        case 'LONGITUDE':
            return false;
        case 'SPECIES':
        case 'SCIENTIFIC NAME':
        case 'ENGLISH NAME':
        case 'SPECIES GROUP':
            return true;
        case 'PROBABILITY':
            return false;
        case 'WARNINGS':
        case 'CALL TYPE':
            return true;
        case 'ACTUAL DATE':
        case 'SURVEY DATE': // Infer american or british
        case 'TIME':
            // 24H
            return false;
        case 'CLASSIFIER NAME':
        case 'USER ID':
        case 'UPLOAD KEY':
        case 'BATCH NAME':
        case 'PROJECT NAME':
            return true;

        default:
            throw 'unknown column ' + columnName;
    }
}

// Maybe integrate process into "integrate"

// columnNames excludes filename
/* eslint no-var: off */
function processTypes(columnNames, content) {
    columnNames = columnNames.map((x: string) => (x == 'SCORE' ? 'PROBABILITY' : x));

    const sets = columnNames.map((a) => (columnNeedsSet(a) ? new ReferenceSet() : undefined));
    const processors = [undefined].concat(
        columnNames.map((n, i) => getProcessorForColumn(n, sets[i]))
    );
    var i;
    for (const r of content) {
        // Skip file identifier
        for (i = 1; i < r.length; i++) {
            r[i] = processors[i](r[i]);
        }
    }
    return sets;
}

export { processTypes };
