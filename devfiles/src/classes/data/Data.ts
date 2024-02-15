/* Don't access data, use DataFilteredAccess */

import FileIdentifierManager from './setutils/FileIdentifierManager';
import { /*integrate,*/ processTypes } from './datautils/table_integrate';
import { parseCSVFromByteArray } from './datautils/csvreader';
import SetElement from './setutils/SetElement';

enum Attribute {
    fileName,
    timestamp, // TODOOOO
    time /*??? */,
    recordingFileName = 'RECORDING FILE NAME',
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
    private fileIdentifiers = new FileIdentifierManager();
    private sortedDatabase: (SetElement | string | number)[][] = [];

    // Columns from 1.
    // 0th column is our file Identifier
    private columnList: string[] = [];

    public addCSV(CSVName: string, CSVFile: Uint8Array) {
        CSVName = this.fileIdentifiers.normaliseIdentifier(CSVName);
        const CSVIdentifier = this.fileIdentifiers.add(CSVName);

        const { columnNames, content } = parseCSVFromByteArray(CSVFile, CSVIdentifier);
        // depending on what it modifies
        // leave this to later: TODO: proper integrate
        //integrate(this.columnList, this.sortedDatabase, )
        processTypes(columnNames, content);
        // TODO: proper merge
        this.sortedDatabase = content;
        this.columnList = columnNames;
    }

    // For reading only
    public readDatabase() {
        return this.sortedDatabase;
    }

    // For accessing cell data
    public getAccessorForColumn(
        a: Attribute
    ): (row: SetElement | number | string) => SetElement | number | string {
        const index = getColumnIndex(a, this.columnList);
        if (index == -1) {
            throw 'no such column!';
        }
        return (row) => row[index];
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
            return columnList.indexOf(a) + 1;
    }
}

export { Data, Attribute };
