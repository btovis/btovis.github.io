/* Handles merging multiple files together */
//import FileIdentifierManager from "../setutils/FileIdentifierManager";

import ReferenceSet from '../setutils/ReferenceSet';

function matchColumnNames(upperCaseColumnName) {
    switch (upperCaseColumnName) {
        case 'SCORE':
        case 'CONFIDENCE':
            return 'PROBABILITY';
        case 'COMMON_NAME': // Underscore, because from bird pipeline CSV
            return 'ENGLISH NAME';
        default:
            return upperCaseColumnName;
    }
}

// oldColumnList and newColumnList have 0th element "_FILE"
// precondition and postcondition: see columnList in Data.ts

// oldColumnList modified: new column names added to it
// titleToColumnIndex modified: new columns are added to it
// newColumnList shouldn't be used after this function is called
// oldDatabase modified: new rows are appended to this. old rows are extended~~
// newDatabase shouldn't be used after this function is called
// oldSets modified: new sets appended. older sets now have more elements.
// oldProcessors modified: extended with new columns
function integrateNewCSV(
    oldColumnList: string[],
    titleToColumnIndex: Map<string, number>,
    newColumnList: string[],
    oldDatabase,
    newDatabase,
    oldSets: ReferenceSet[],
    oldProcessors: any[]
) {
    const permutes: number[] = new Array(newColumnList.length);
    permutes[0] = 0;
    // [0,3,1,undefined] means bring 1st column of new to 3rd of old, second to first of old, make a new column for the third
    // undefined means "new column"
    // -2 means "duplicate column, drop it"

    // used for duplicate column detection in the newColumnList
    const earliestColumnWithNameInNew = new Map<string, number>();

    for (let i = 1; i < newColumnList.length; i++) {
        newColumnList[i] = matchColumnNames(newColumnList[i].toUpperCase());
        if (earliestColumnWithNameInNew.get(newColumnList[i]) === undefined) {
            earliestColumnWithNameInNew.set(newColumnList[i], i);
            permutes[i] = titleToColumnIndex.get(newColumnList[i]);
        }
        // a duplicate
        else permutes[i] = -2;
    }

    // Remove duplicate rows
    const columnsToRemove = [];
    permutes.forEach((n, i) => {
        if (n == -2) columnsToRemove.push(i);
    });
    if (columnsToRemove.length) {
        for (let r = 0; r < newDatabase.length; r++) {
            const ro = newDatabase[r];
            for (let i = columnsToRemove.length - 1; i >= 0; i--) ro.splice(columnsToRemove[i], 1);
        }
        for (let i = columnsToRemove.length - 1; i >= 0; i--) {
            newColumnList.splice(columnsToRemove[i], 1);
            permutes.splice(columnsToRemove[i], 1);
        }
    }

    // Which columns are new, which are old?
    // assign undefineds their columns
    const originalColumnCount = oldColumnList.length;
    let nextColumn = originalColumnCount;
    for (let i = 0; i < permutes.length; i++) {
        if (permutes[i] === undefined) {
            permutes[i] = nextColumn;
            oldColumnList.push(newColumnList[i]);
            titleToColumnIndex.set(newColumnList[i], nextColumn);
            nextColumn++;
        }
    }

    const columnCount = nextColumn;
    let permutationNeeded = false;
    // Use originalColumnCount: no need to permutate if only extension needed
    for (let i = 0; i < originalColumnCount; i++) {
        if (permutes[i] != i) {
            permutationNeeded = true;
            break;
        }
    }

    const oldDBLen = oldDatabase.length,
        newDBLen = newDatabase.length;
    const finalDBLen = (oldDatabase.length = oldDBLen + newDBLen);

    if (permutationNeeded) {
        for (let r = 0; r < newDBLen; r++) {
            const ro = newDatabase[r];
            const ro2 = (oldDatabase[r + oldDBLen] = new Array(columnCount));
            for (let i = 0; i < columnCount; i++) ro2[permutes[i]] = ro[i];
        }
    } else {
        for (let r = 0; r < newDBLen; r++) {
            const ro = newDatabase[r];
            const ro2 = (oldDatabase[r + oldDBLen] = new Array(columnCount));
            for (let i = 0; i < columnCount; i++) ro2[i] = ro[i];
        }
    }

    // Free memory
    newDatabase.length = 0;
    newColumnList.length = 0;

    // Extend processors, process old data
    // NOTE: NOT IMPLEMENTED: it isn't useful to extend old data with NaN, unknown dates, and SetElement("") and ""
    // INCONSISTENCY: but we do process empty columns of the new rows (if the new data doesn't have some columns as the original)

    // Extend processors, process new data with both old and new processors
    // for this, extend set

    const newColumns = oldColumnList.slice(originalColumnCount);
    const newSets = newColumns.map((a) => (columnNeedsSet(a) ? new ReferenceSet() : undefined));
    const newProcessors = newColumns.map((n, i) => getProcessorForColumn(n, newSets[i]));
    oldSets.push(...newSets);
    oldProcessors.push(...newProcessors);
    for (let i = oldDBLen; i < finalDBLen; i++) {
        const r = oldDatabase[i];
        // Skip file identifier
        for (let z = 1; z < columnCount; z++) {
            r[z] = oldProcessors[z](r[z]);
        }
    }
}

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
        case '_FILE':
            return true;
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

export { integrateNewCSV };
