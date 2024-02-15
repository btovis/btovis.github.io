/* Don't access data, use DataFilteredAccess */

import normaliseIdentifier from './setutils/FileIdentifierUtil.ts';
import { /*integrate,*/ processTypes } from './datautils/table_integrate';
import { parseCSVFromByteArray } from './datautils/csvreader';
import SetElement from './setutils/SetElement';
import ReferenceSet from './setutils/ReferenceSet.ts';

enum Attribute {
    fileName,
    timestamp, // TODOOOO
    time /*??? */,
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

class Data {
    // Don't access sortedDatabase and sets and fileIdentifiers
    public sortedDatabase: (SetElement | string | number)[][] = [];
    public sets = [new ReferenceSet()]; // The 0th element are the files

    // 0th element in this array is column 1
    // column 0 is file identifier
    public columnList: string[] = ['_FILE'];

    public addCSV(CSVName: string, CSVFile: Uint8Array) {
        CSVName = normaliseIdentifier(CSVName, this.sets[0]);
        const CSVIdentifier = this.sets[0].addRawOrGet(CSVName);

        const { columnNames, content } = parseCSVFromByteArray(CSVFile, CSVIdentifier);
        // depending on what it modifies
        // leave this to later: TODO: proper integrate
        //integrate(this.columnList, this.sortedDatabase, )
        // TODO: reuse sets for the second file

        // need proper integrate here.
        this.sets = this.sets.concat(processTypes(columnNames, content));
        // TODO: proper merge
        // TODO: sort!!
        this.sortedDatabase = content;
        this.columnList = this.columnList.concat(columnNames);
    }

    // For reading only
    public readDatabase() {
        return this.sortedDatabase;
    }

    // For accessing cell data
    // filname: 0
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
        case Attribute.time:
        case Attribute.timestamp:
            return -3;
        default:
            return columnList.indexOf(a);
    }
}

export { Data, Attribute };
