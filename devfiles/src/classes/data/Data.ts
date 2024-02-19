/* Don't access data, use DataFilteredAccess */

import normaliseIdentifier from './setutils/FileIdentifierUtil.ts';
import { integrateNewCSV, processTypes } from './datautils/table_integrate';
import { parseCSVFromByteArray } from './datautils/csvreader';
import SetElement from './setutils/SetElement';
import ReferenceSet from './setutils/ReferenceSet.ts';

enum Attribute {
    csvName = '_FILE',
    recordingFileName = 'RECORDING FILE NAME',
    originalFileName = 'ORIGINAL FILE NAME',
    recordingFilePart = 'ORIGINAL FILE PART',
    latitude = 'LATITUDE',
    longitude = 'LONGITUDE',
    species = 'SPECIES',
    speciesEnglishName = 'ENGLISH NAME',
    speciesLatinName = 'SCIENTIFIC NAME',
    speciesGroup = 'SPECIES GROUP',
    probability = 'PROBABILITY',
    warnings = 'WARNINGS',
    callType = 'CALL TYPE',
    classifierName = 'CLASSIFIER NAME',
    userID = 'USER ID',
    actualDate = 'ACTUAL DATE',
    surveyDate = 'SURVEY DATE',
    uploadKey = 'UPLOAD KEY',
    batchName = 'BATCH NAME',
    projectName = 'PROJECT NAME'
}

// Calling addCSV will require calling dataUpdated in all DataFiltered!!!!!

// TODO: delete file function? scan database, remake sets by rescanning all, recall statistician for all of it, keep columns the same.
class Data {
    // sortedDatabase is actually unsorted
    public sortedDatabase: (SetElement | string | number)[][] = [];
    public sets = [new ReferenceSet()]; // The 0th element are the files

    // 0th element in this array is column 1
    // column 0 is file identifier
    // all elements are capitalised and the array is duplicate-free
    public columnList: string[] = ['_FILE'];

    public readDatabase() {
        return this.sortedDatabase;
    }

    // see the method below to access it
    private titleToColumnIndex = new Map<string, number>([['_FILE', 0]]);
    private cellProcessors = [(a) => this.sets[0].addRawOrGet(a)];

    // Throws an error message (such as: malformed CSV) to be appended to filename to become "abc.csv: malformed CSV"
    /* eslint no-var: off */
    public addCSV(CSVName: string, CSVFile: Uint8Array) {
        CSVName = normaliseIdentifier(CSVName, this.sets[0]);
        const CSVIdentifier = this.sets[0].addRawOrGet(CSVName);
        try {
            var { columnNames, content } = parseCSVFromByteArray(CSVFile, CSVIdentifier);
        } catch (e) {
            throw 'Malformed CSV ' + e;
        }

        integrateNewCSV(
            this.columnList,
            this.titleToColumnIndex,
            columnNames,
            this.sortedDatabase,
            content,
            this.sets,
            this.cellProcessors
        );
    }

    // filename: 0
    public getIndexForColumn(a: Attribute): number {
        const index = this.titleToColumnIndex.get(a);
        if (index === undefined) {
            throw 'no such column ' + a + ' in ' + this.columnList;
        }
        return index;
    }
}

export { Data, Attribute };
