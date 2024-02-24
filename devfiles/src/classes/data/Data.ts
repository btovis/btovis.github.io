/* Don't access data, use DataFilteredAccess */

import normaliseIdentifier from './setutils/FileIdentifierUtil.ts';
import { integrateNewCSV } from './datautils/table_integrate';
import { parseCSVFromByteArray } from './datautils/csvreader';
import SetElement from './setutils/SetElement';
import ReferenceSet from './setutils/ReferenceSet.ts';
import DataStats from './DataStats.ts';

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
    private sortedDatabase: (SetElement | string | number)[][] = [];
    public sets = [new ReferenceSet()]; // The 0th element are the files

    // 0th element in this array is column 1
    // column 0 is file identifier
    // all elements are capitalised and the array is duplicate-free
    public columnList: string[] = ['_FILE'];

    // Data class is blind about what each column represents. dataStats gives meaningful data about important columns's useful ranges and stats
    // (Date, 'ACTUAL DATE' is also handled by Data, but processed in isolation for each csv)
    public dataStats: DataStats = new DataStats(this);

    public readDatabase() {
        return this.sortedDatabase;
    }

    public isEmpty(): boolean {
        return this.readDatabase().length === 0;
    }

    // see the method below to access it
    private titleToColumnIndex = new Map<string, number>([['_FILE', 0]]);
    private cellProcessors = [(a) => this.sets[0].addRawOrGet(a)];

    // Throws an error message (such as: malformed CSV) to be appended to filename to become "abc.csv: malformed CSV"
    /* eslint no-var: off */
    public addCSV(CSVName: string, CSVFile: Uint8Array, finaliseLater: boolean) {
        CSVName = normaliseIdentifier(CSVName, this.sets[0]);
        const CSVIdentifier = this.sets[0].addRawOrGet(CSVName);
        try {
            var { columnNames, content } = parseCSVFromByteArray(CSVFile, CSVIdentifier);
        } catch (e) {
            this.sets[0].removeRef(CSVIdentifier);
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
        if (!finaliseLater) this.dataStats.refresh();
    }

    public finaliseAdding() {
        this.dataStats.refresh();
    }

    public removeCSV(CSVName: string) {
        const CSVIdentifier = this.sets[0].raws.get(CSVName);
        if (!CSVIdentifier) return;
        this.sets[0].removeRef(CSVIdentifier);
        let newI = 0,
            oldI = 0;
        const db = this.sortedDatabase,
            len = db.length;
        for (; oldI < len; oldI++) {
            const r = db[oldI];
            if (r[0] != CSVIdentifier) {
                db[newI] = r;
                newI++;
            }
        }
        db.length = newI;
        this.dataStats.refresh();
    }

    // On delete, rescan the remaining list, and take out from sets
    public remakeSets() {}

    // filename: 0
    public getIndexForColumn(a: Attribute | string): number {
        const index = this.titleToColumnIndex.get(a);
        if (index === undefined) {
            throw 'no such column ' + a + ' in ' + this.columnList;
        }
        return index;
    }
}

export { Data, Attribute };
