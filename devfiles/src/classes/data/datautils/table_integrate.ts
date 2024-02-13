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

function getProcessorForRow(columnName) /*: (cell: string) => any*/ {
    switch (columnName) {
        case 'RECORDING FILE NAME':
            return (x) => x;
        case 'ORIGINAL FILE PART':
            return parseInt;
        case 'LATITUDE':
            return parseFloat;
        case 'LONGITUDE':
            return parseFloat;
        case 'SPECIES': // Set
            return (x) => x;
        case 'SCIENTIFIC NAME': // Set
            return (x) => x;
        case 'ENGLISH NAME': // Set
            return (x) => x;
        case 'SPECIES GROUP': // Set
            return (x) => x;
        case 'PROBABILITY':
            return parseInt;
        case 'WARNINGS': // Set, or null
            return (x) => x;
        case 'CALL TYPE':
            // TODO Handle nulls, string set
            return (x) => x;

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
            return (x) => x;

        case 'USER ID':
            // Set
            return (x) => x;

        case 'UPLOAD KEY':
            // Set
            return (x) => x;

        case 'BATCH NAME':
            // Set
            return (x) => x;

        case 'PROJECT NAME':
            // Set
            return (x) => x;

        // For now:
        // TODO: sets, infer american or british
        default:
            return (x) => x;
    }
}

// Maybe integrate process into "integrate"

function processTypes(columnNames, content) {
    columnNames = columnNames.map((x: string) => {
        x == 'SCORE' ? 'PROBABILITY' : x;
    });

    const processors = columnNames.map((n) => getProcessorForRow(n));
    for (const r of content) {
        // Skip file identifier
        for (let i = 1; i < r.length; i++) {
            r[i] = processors[i - 1](r[i]);
        }
    }
}

export { processTypes };
