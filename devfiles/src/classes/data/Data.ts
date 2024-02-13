/* Don't access data, use DataFilteredAccess */

import FileIdentifierManager from './setutils/FileIdentifierManager';
import { /*integrate,*/ processTypes } from './datautils/table_integrate';
import { parseCSVFromByteArray } from './datautils/csvreader';
import SetElement from './setutils/SetElement';

enum Attribute {
    fileName,
    recordingFileName,
    recordingFilePart,
    latitude,
    longitude,
    species,
    speciesEnglishName,
    speciesLatinName,
    speciesGroup,
    probability,
    warnings,
    callType,
    timestamp, // TODOOOO
    classifierName,
    userID,
    actualDate,
    surveyDate,
    time /*??? */,
    uploadKey,
    batchName,
    projectName
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
        case Attribute.recordingFileName:
            return columnList.indexOf('RECORDING FILE NAME');
        case Attribute.recordingFilePart:
            return columnList.indexOf('ORIGINAL FILE PART');
        case Attribute.latitude:
            return columnList.indexOf('LATITUDE');
        case Attribute.longitude:
            return columnList.indexOf('LONGITUDE');
        case Attribute.species:
            return columnList.indexOf('SPECIES');
        case Attribute.speciesEnglishName:
            return columnList.indexOf('ENGLISH NAME');
        case Attribute.speciesLatinName:
            return columnList.indexOf('SCIENTIFIC NAME');
        case Attribute.speciesGroup:
            return columnList.indexOf('SPECIES GROUP');
        case Attribute.probability:
            return columnList.indexOf('PROBABILITY');
        case Attribute.warnings:
            return columnList.indexOf('WARNINGS');
        case Attribute.callType:
            return columnList.indexOf('CALL TYPE');
        case Attribute.timestamp:
            return -3; // TODOOOO return columnList.indexOf("");
        case Attribute.classifierName:
            return columnList.indexOf('CLASSIFIER NAME');
        case Attribute.userID:
            return columnList.indexOf('USER ID');
        case Attribute.actualDate:
            return columnList.indexOf('ACTUAL DATE');
        case Attribute.surveyDate:
            return columnList.indexOf('SURVEY DATE');
        case Attribute.time:
            /*??? */ return columnList.indexOf('TIME');
        case Attribute.uploadKey:
            return columnList.indexOf('UPLOAD KEY');
        case Attribute.batchName:
            return columnList.indexOf('BATCH NAME');
        case Attribute.projectName:
            return columnList.indexOf('PROJECT NAME');
    }
}

export { Data, Attribute };
