import SetElement from '../data/setutils/SetElement';
import { Attribute, Data } from '../data/Data';
import Row from '../data/Row';
import ReferenceSet from '../data/setutils/ReferenceSet';
import { Filter } from '../filters/Filter';
import DataFilterer from '../data/DataFilterer';

abstract class Grouping {
    filter: DataFilterer;
    referenceSet: ReferenceSet;
    speciesColumnIdx: number;
    constructor(filter: DataFilterer) {
        this.filter = filter;
        this.referenceSet = new ReferenceSet();
        this.speciesColumnIdx = filter.getColumnIndex(Attribute.speciesLatinName);
    }
    // Select the value to be used for the x-axis.
    public abstract selectX(row: Row): SetElement;
    public selectByColumnIndex(row: Row, columnIdx: number): SetElement {
        if (row[columnIdx] instanceof SetElement) {
            return row[columnIdx];
        }
        // Create a new set element and add the value to the reference set.
        return this.referenceSet.addRawOrGet(row[columnIdx]);
    }
    // Select the value to be used for the y-axis.
    public selectY(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.speciesColumnIdx);
    }
    // Select pairs of x-y values that will be aggregated and plotted.
    public generatePairs(): [SetElement, SetElement][] {
        const [data, length] = this.filter.getData();
        const dataSubset = data.slice(0, length);
        return dataSubset.map((row) => [this.selectX(row), this.selectY(row)]);
    }
    // Aggregate the pairs of x-y values.
    public aggregatePairs() {
        const pairs = this.generatePairs();
        // use y as the first key and x as the second
        const aggregated = new Map<SetElement, Map<SetElement, number>>();
        for (const [x, y] of pairs) {
            if (!aggregated.has(y)) {
                aggregated.set(y, new Map<SetElement, number>());
            }
            if (aggregated.get(y).has(x)) {
                aggregated.get(y).set(x, aggregated.get(y).get(x).valueOf() + 1);
            } else {
                aggregated.get(y).set(x, 1);
            }
        }
        return aggregated;
    }
    // Generate a trace that includes the core data but excludes the additional config.
    public getPartialTraces() {}
    public getTraces(data: Data, additionalConfig: { [key: string]: any }) {}
}

class BatchNameGrouping extends Grouping {
    columnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.columnIdx = filter.getColumnIndex(Attribute.batchName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
}

class ProjectNameGrouping extends Grouping {
    columnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.columnIdx = filter.getColumnIndex(Attribute.projectName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
}

class FilenameGrouping extends Grouping {
    columnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.columnIdx = filter.getColumnIndex(Attribute.originalFileName);
    }
    public selectX(row: Row): SetElement {
        return this.selectByColumnIndex(row, this.columnIdx);
    }
}

abstract class TimeGrouping extends Grouping {
    timeColumnIdx: number;
    dateColumnIdx: number;
    constructor(filter: DataFilterer) {
        super(filter);
        this.timeColumnIdx = filter.getColumnIndex(Attribute.time);
        this.dateColumnIdx = filter.getColumnIndex(Attribute.actualDate);
    }
    public selectX(row: Row): SetElement {
        return this.referenceSet.addRawOrGet(
            this.timeToValue(new Date(row[this.dateColumnIdx] + ' ' + row[this.timeColumnIdx]))
        );
    }
    public abstract timeToValue(datetime: Date): string;
}

class HourGrouping extends TimeGrouping {
    public timeToValue(datetime: Date): string {
        return `${datetime.getHours().toString().padStart(2, '0')}:00`;
    }
}

class MonthGrouping extends TimeGrouping {
    public timeToValue(datetime: Date): string {
        return [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ][datetime.getMonth()];
    }
}

class YearGrouping extends TimeGrouping {
    public timeToValue(datetime: Date): string {
        return datetime.getFullYear().toString();
    }
}

export {
    Grouping,
    BatchNameGrouping,
    FilenameGrouping,
    ProjectNameGrouping,
    TimeGrouping,
    HourGrouping,
    MonthGrouping,
    YearGrouping
};
