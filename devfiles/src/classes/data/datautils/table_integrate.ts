/* Handles merging multiple files together */
//import FileIdentifierManager from "../setutils/FileIdentifierManager";

import { getSpeciesEndangerment } from '../../../utils/speciesVulnerability';
import { Attribute } from '../Data';
import ReferenceSet from '../setutils/ReferenceSet';
import { processDates, processTimes } from './date';

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
    oldSets: ReferenceSet[]
) {
    for (let i = 1; i < newColumnList.length; i++) {
        newColumnList[i] = newColumnList[i].toUpperCase();
    }
    if (!newColumnList.includes('PROBABILITY') && newColumnList.includes('CONFIDENCE')) {
        newColumnList[newColumnList.indexOf('CONFIDENCE')] = 'PROBABILITY';
    }
    if (!newColumnList.includes('PROBABILITY') && newColumnList.includes('SCORE')) {
        newColumnList[newColumnList.indexOf('SCORE')] = 'PROBABILITY';
    }
    if (newColumnList.includes('COMMON_NAME')) {
        // Bird CSV.
        if (!newColumnList.includes('ACTUAL DATE') && newColumnList.includes('DATE')) {
            newColumnList[newColumnList.indexOf('DATE')] = 'ACTUAL DATE';
        }
        if (newColumnList.includes('ACTUAL DATE') && !newColumnList.includes('SURVEY DATE')) {
            // todo: copy from actual date?
            newColumnList.push('SURVEY DATE');
            for (const r of newDatabase) {
                r.push('0000-00-00');
            }
        }

        if (!newColumnList.includes('SPECIES')) {
            newColumnList[newColumnList.indexOf('SP_CODE')] = 'SPECIES';
        }
        if (!newColumnList.includes('ENGLISH NAME')) {
            // rename common name to english name
            newColumnList[newColumnList.indexOf('COMMON_NAME')] = 'ENGLISH NAME';
        }
        if (!newColumnList.includes('SCIENTIFIC NAME')) {
            // rename COMMON_NAME ('ENGLISH NAME')to scientific name
            newColumnList.push('SCIENTIFIC NAME');
            const colI = newColumnList.indexOf('ENGLISH NAME');
            if (colI == -1) {
                throw 'Unsupported csv';
            }
            if (colI)
                for (const r of newDatabase) {
                    r.push(r[colI]);
                }
        }
        if (!newColumnList.includes('SPECIES GROUP')) {
            newColumnList.push('SPECIES GROUP');
            for (const r of newDatabase) {
                r.push('Bird classifier species');
            }
        }
        if (!newColumnList.includes('WARNINGS')) {
            newColumnList.push('WARNINGS');
            for (const r of newDatabase) {
                r.push('[Bird classifier does not output warnings]');
            }
        }
        if (!newColumnList.includes('CALL TYPE')) {
            newColumnList.push('CALL TYPE');
            for (const r of newDatabase) {
                r.push('[Bird classifier does not output call type]');
            }
        }
        if (!newColumnList.includes('PROJECT NAME')) {
            newColumnList.push('PROJECT NAME');
            for (const r of newDatabase) {
                r.push('[Bird classifier]');
            }
        }
        if (!newColumnList.includes('CLASSIFIER NAME')) {
            newColumnList.push('CLASSIFIER NAME');
            for (const r of newDatabase) {
                r.push('[Bird classifier]');
            }
        }
        if (!newColumnList.includes('BATCH NAME')) {
            newColumnList.push('BATCH NAME');
            for (const r of newDatabase) {
                r.push('[Bird classifier]');
            }
        }
        if (!newColumnList.includes('USER ID')) {
            newColumnList.push('USER ID');
            for (const r of newDatabase) {
                r.push('[Bird classifier]');
            }
        }
    }

    if (!newColumnList.includes('TIME')) {
        throw 'No Time column found';
    }

    if (!newColumnList.includes('ACTUAL DATE')) {
        throw 'No Date/Actual Date column found';
    }

    if (!newColumnList.includes('PROBABILITY')) {
        throw 'No Probability/confidence/score column found';
    }

    if (!newColumnList.includes('ENGLISH NAME')) {
        throw 'No ENGLISH NAME column found';
    }

    if (!newColumnList.includes('SCIENTIFIC NAME')) {
        throw 'No SCIENTIFIC NAME column found';
    }

    if (!newColumnList.includes('SPECIES')) {
        throw 'No SPECIES column found';
    }

    if (!newColumnList.includes('SPECIES GROUP')) {
        throw 'No SPECIES GROUP column found';
    }

    if (!newColumnList.includes('VULNERABILITY')) {
        newColumnList.push('VULNERABILITY');
        const colI = newColumnList.indexOf('SCIENTIFIC NAME');
        for (const r of newDatabase) r.push(getSpeciesEndangerment(r[colI]));
    }

    const rowLen = newColumnList.length;
    for (const r of newDatabase) {
        for (let i = 0; i < rowLen; i++) if (r[i].trim) r[i] = r[i].trim();
    }

    // add lat and loc if not existing
    if (!newColumnList.includes('LATITUDE')) {
        newColumnList.push('LATITUDE');
        for (const r of newDatabase) r.push(Infinity);
    }

    if (!newColumnList.includes('LONGITUDE')) {
        newColumnList.push('LONGITUDE');
        for (const r of newDatabase) r.push(Infinity);
    }

    const permutes: number[] = new Array(newColumnList.length);
    permutes[0] = 0;
    // [0,3,1,undefined] means bring 1st column of new to 3rd of old, second to first of old, make a new column for the third
    // undefined means "new column"
    // -2 means "duplicate column, drop it"

    // used for duplicate column detection in the newColumnList
    const earliestColumnWithNameInNew = new Map<string, number>([['_FILE', 0]]);

    for (let i = 1; i < newColumnList.length; i++) {
        if (earliestColumnWithNameInNew.get(newColumnList[i]) === undefined) {
            earliestColumnWithNameInNew.set(newColumnList[i], i);
            permutes[i] = titleToColumnIndex.get(newColumnList[i]);
        }
        // a duplicate
        else permutes[i] = -2;
    }

    if (!newColumnList.includes('TIME')) {
        throw 'No Time column found';
    }

    if (!newColumnList.includes('ACTUAL DATE')) {
        throw 'No Date/Actual Date column found';
    }

    if (!newColumnList.includes('ENGLISH NAME')) {
        throw 'No ENGLISH NAME column found';
    }

    if (!newColumnList.includes('SCIENTIFIC NAME')) {
        throw 'No SCIENTIFIC NAME column found';
    }

    if (!newColumnList.includes('SPECIES')) {
        throw 'No SPECIES column found';
    }

    if (!newColumnList.includes('SPECIES GROUP')) {
        throw 'No SPECIES GROUP column found';
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
            // fill can be optimised
            const ro2 = (oldDatabase[r + oldDBLen] = new Array(columnCount)).fill('');
            for (let i = 0; i < columnCount; i++) ro2[permutes[i]] = ro[i];
        }
    } else {
        for (let r = 0; r < newDBLen; r++) {
            const ro = newDatabase[r];
            // fill can be optimised
            const ro2 = (oldDatabase[r + oldDBLen] = new Array(columnCount)).fill('');
            for (let i = 0; i < columnCount; i++) ro2[i] = ro[i];
        }
    }

    // Free memory
    newDatabase.length = 0;
    newColumnList.length = 0;

    const newColumns = oldColumnList.slice(originalColumnCount);
    const newSets = newColumns.map((a) => (columnNeedsSet(a) ? new ReferenceSet() : undefined));
    oldSets.push(...newSets);
    const newProcessors = oldColumnList.map((n, i) => getProcessorForColumn(n, oldSets[i]));

    // handle time: get index of actual ...
    // make processor, replace previous with it

    const dateCol = titleToColumnIndex.get(Attribute.actualDate);
    processDates(oldDatabase, oldDBLen, dateCol);

    const surveyDateCol = titleToColumnIndex.get(Attribute.surveyDate);
    processDates(oldDatabase, oldDBLen, surveyDateCol);

    const timeCol = titleToColumnIndex.get(Attribute.time);
    processTimes(oldDatabase, oldDBLen, timeCol);

    // Go back to original data, extend with "", process them
    if (oldDBLen != 0 && newDBLen != 0) {
        const oldRowLength = oldDatabase[0].length;
        const newRowLength = oldDatabase[oldDBLen].length;
        if (newRowLength < oldRowLength) throw 'Internal error: new row shorter than old';
        for (let i = 0; i < oldDBLen; i++) {
            const r = oldDatabase[i];
            r.length = newRowLength;
            for (let x = oldRowLength; x < newRowLength; x++) r[x] = newProcessors[x]('');
        }
    }

    for (let i = oldDBLen; i < finalDBLen; i++) {
        const r = oldDatabase[i];
        // Skip file identifier
        for (let z = 1; z < columnCount; z++) {
            r[z] = newProcessors[z](r[z]);
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
            return (x) => x;

        case 'SURVEY DATE':
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
        case 'VULNERABILITY':
            // Set
            return (a) => set.addRawOrGet(a);

        case 'VIEW':
            // Set
            return (a) => set.addRawOrGet(a);
        case 'LOW_HZ':
            return parseInt;
        case 'HIGH_HZ':
            return parseInt;
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
        case 'VULNERABILITY':
        case 'VIEW':
            return true;

        default:
            return false; //'unknown column ' + columnName;
    }
}

export { integrateNewCSV };
