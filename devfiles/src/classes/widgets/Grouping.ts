import SetElement from '../data/setutils/SetElement';
import { Attribute, Data } from '../data/Data';
import Row from '../data/Row';
import ReferenceSet from '../data/setutils/ReferenceSet';
import { Filter } from '../filters/Filter';
import DataFilterer from '../data/DataFilterer';

abstract class Grouping {
    filter: DataFilterer;
    referenceSet: ReferenceSet;
    xValues: Set<SetElement>;
    speciesColumnIdx: number;
    constructor(filter: DataFilterer) {
        this.filter = filter;
        this.referenceSet = new ReferenceSet();
        this.speciesColumnIdx = filter.getColumnIndex(Attribute.speciesLatinName);
        this.xValues = new Set();
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
        return dataSubset.map((row) => {
            const x = this.selectX(row);
            this.xValues.add(x);
            return [x, this.selectY(row)];
        });
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
    // Convert x values to integers to display on chart.
    // Must be called after all pairs have been generated.
    public xValueMap() {
        const sortedXValues = Array.from(this.xValues).sort((a, b) =>
            a.value.localeCompare(b.value)
        );
        const xValueMap = new Map<SetElement, number>();
        for (let i = 0; i < sortedXValues.length; i++) {
            xValueMap.set(sortedXValues[i], i);
        }
        return xValueMap;
    }
    // Generate a trace that includes the core data but excludes the additional config.
    public getPartialTraces() {
        const plottingData = this.aggregatePairs();
        const xValueMap = this.xValueMap();
        return Array.from(plottingData.entries()).map(([group, xMap]) => {
            const xValues = Array.from(xMap.keys());
            const yValues = Array.from(xMap.values());
            const x = xValues.map((x) => xValueMap.get(x));
            return {
                x: x,
                y: yValues,
                name: group.value
            };
        });
    }
    public getTraces(additionalConfig: { [key: string]: any }) {
        return this.getPartialTraces().map((trace) => {
            return {
                ...trace,
                ...additionalConfig
            };
        });
    }
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
        return this.formatHour(datetime.getHours());
    }
    private formatHour(hour: number): string {
        return `${hour.toString().padStart(2, '0')}:00`;
    }

    public xValueMap() {
        const hours = Array.from(this.xValues).map((x) => parseInt(x.value.split(':')[0]));
        const minHour = Math.min(...hours);
        const maxHour = Math.max(...hours);
        const valueMap = new Map<SetElement, number>();
        for (let i = minHour; i <= maxHour; i++) {
            valueMap.set(this.referenceSet.addRawOrGet(this.formatHour(i)), i - minHour);
        }
        return valueMap;
    }
}

class MonthGrouping extends TimeGrouping {
    static months = [
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
    ];
    public timeToValue(datetime: Date): string {
        return MonthGrouping.months[datetime.getMonth()];
    }
    public xValueMap() {
        const monthIndices = Array.from(this.xValues).map((x) =>
            MonthGrouping.months.indexOf(x.value)
        );
        const minMonth = Math.min(...monthIndices);
        const maxMonth = Math.max(...monthIndices);
        const valueMap = new Map<SetElement, number>();
        for (let i = minMonth; i <= maxMonth; i++) {
            valueMap.set(this.referenceSet.addRawOrGet(MonthGrouping.months[i]), i - minMonth);
        }
        return valueMap;
    }
}

class YearGrouping extends TimeGrouping {
    public timeToValue(datetime: Date): string {
        return datetime.getFullYear().toString();
    }
    public xValueMap() {
        const years = Array.from(this.xValues).map((x) => parseInt(x.value));
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const valueMap = new Map<SetElement, number>();
        for (let i = minYear; i <= maxYear; i++) {
            valueMap.set(this.referenceSet.addRawOrGet(i.toString()), i - minYear);
        }
        return valueMap;
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
