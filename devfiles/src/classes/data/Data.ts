/* Don't access data, use DataFilteredAccess */

import normaliseIdentifier from './setutils/FileIdentifierUtil.ts';
import { /*integrate,*/ processTypes } from './datautils/table_integrate';
import { parseCSVFromByteArray } from './datautils/csvreader';
import SetElement from './setutils/SetElement';
import ReferenceSet from './setutils/ReferenceSet.ts';

enum Attribute {
    fileName,
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
    private sortedDatabase: (SetElement | string | number)[][] = [];
    public sets = [new ReferenceSet()]; // The 0th element are the files

    // 0th element in this array is column 1
    // column 0 is file identifier
    public columnList: string[] = ['_FILE'];

    public readDatabase() {
        return this.sortedDatabase;
    }

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

        // One function to return processors for columnNames
        // The other taking columnList and columnNames, giving a list length columnNames with permute lambdas
        // (Permute: take common rows first, then remaining in order)
        // A third giving sets and setmakers for new columns
        // With sets, for older files, need to go through them for older columns so tag them empty

        // Data statistician: what does it take on update? new rows, old rows, columnlist. refresh for rescanning on deleted file
        // Data taxonomist: updated rows. refresh for rescanning on deleted file

        // One function to take old columnlist, new columnlist, new rows, old rows
        // permutes new rows, gives new sets, makes processor for old rows internally and processes them (for each element, adds null there)

        // need proper integrate here.
        this.sets = this.sets.concat(processTypes(columnNames, content));
        // TODO: proper merge
        // TODO: sort!!
        this.sortedDatabase = content;
        this.columnList = this.columnList.concat(columnNames);
    }

    // For accessing cell data
    // filename: 0
    public getIndexForColumn(a: Attribute): number {
        const index = getColumnIndex(a, this.columnList);
        if (index == -1) {
            throw 'no such column ' + a + ' in ' + this.columnList;
        }
        return index;
    }
}

function getColumnIndex(a: Attribute, columnList: string[]): number {
    switch (a) {
        case Attribute.fileName:
            return 0;
        default:
            return columnList.indexOf(a);
    }
}

export { Data, Attribute };
